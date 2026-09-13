import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import TutorialStateContext, {
	TutorialStatus,
	type TutorialContextValue,
} from '../context/tutorialContext';
import { resetDemoStore, seedDemoStore } from '../services/demo';

/**
 * Owns the demo/real store toggle for the guided tour.
 *
 * Sits above `HomesProvider`, which reads `isDemo` to decide which database to
 * open. The status is held in memory only: a refresh mid-tour lands back on the
 * real app, which is the safe way for this to fail.
 */
function TutorialProvider({ children }: { children: React.ReactNode }) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [status, setStatus] = useState(TutorialStatus.OFF);

	// Guards a second start while the first is still seeding. A ref rather than
	// `status`, because React's development double-invoked effects fire the entry
	// route's start twice before either state update has flushed, and two
	// concurrent seeds would leave the demo home duplicated.
	const isStartingRef = useRef(false);

	const startTutorial = useCallback(async () => {
		if (isStartingRef.current) {
			return;
		}

		isStartingRef.current = true;
		setStatus(TutorialStatus.STARTING);

		try {
			await seedDemoStore(t);
			setStatus(TutorialStatus.RUNNING);
		} catch {
			// Only the demo store can have failed here — the real one was never
			// opened — so drop back to the app rather than strand the user on a
			// half-started tour.
			setStatus(TutorialStatus.OFF);
		} finally {
			isStartingRef.current = false;
		}

		void navigate('/');
	}, [t, navigate]);

	const endTutorial = useCallback(async () => {
		// Flip first. `HomesProvider` swaps back to the real store on this render,
		// so the wipe below lands on a database nothing is reading any more.
		setStatus(TutorialStatus.OFF);
		void navigate('/');

		await resetDemoStore();
	}, [navigate]);

	const tutorialState: TutorialContextValue = {
		status,
		isDemo: status === TutorialStatus.RUNNING,
		startTutorial,
		endTutorial,
	};

	return <TutorialStateContext.Provider value={tutorialState}>{children}</TutorialStateContext.Provider>;
}

export default TutorialProvider;
