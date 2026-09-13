import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import TutorialStateContext, {
	TutorialStatus,
	type TutorialContextValue,
} from '../context/tutorialContext';
import { resetDemoStore, seedDemoStore } from '../services/demo';

// Where the router says we are in the session history. See also `useSmartBack`.
function historyIndex(): number | undefined {
	return (window.history.state as { idx?: number } | null)?.idx;
}

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

	// The history entry the tour started from. Everything above it on the stack
	// belongs to the tour — its hands-on steps have the user tap real links, which
	// push — and `endTutorial` rewinds to it so none of that outlives the tour.
	const entryIndexRef = useRef<number | undefined>(undefined);

	const startTutorial = useCallback(async () => {
		if (isStartingRef.current) {
			return;
		}

		isStartingRef.current = true;
		entryIndexRef.current = historyIndex();
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

		// Replace, so the `/tutorial` entry itself becomes home. Left on the stack,
		// Back would eventually land on it and start the whole tour over again.
		void navigate('/', { replace: true });
	}, [t, navigate]);

	const endTutorial = useCallback(async () => {
		// Flip first. `HomesProvider` swaps back to the real store on this render,
		// so the wipe below lands on a database nothing is reading any more.
		setStatus(TutorialStatus.OFF);

		// Rewind past every entry the tour added, back to the one it started from —
		// which `startTutorial` left pointing at home. Otherwise Back walks the user
		// through the tour's pages again, this time on their real data.
		//
		// Only ever backwards: `navigate(0)` is `history.go(0)`, a full reload. If
		// the user has already stepped back to (or past) where the tour began, there
		// is nothing left to unwind, so just make sure they end up home.
		const entry = entryIndexRef.current;
		const current = historyIndex();
		if (entry !== undefined && current !== undefined && entry < current) {
			void navigate(entry - current);
		} else {
			void navigate('/', { replace: true });
		}

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
