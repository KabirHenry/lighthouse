import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import { TutorialStatus } from '../context/tutorialContext';
import useTutorialContext from '../hooks/useTutorialContext';
import { titleWithBeacon } from './titleWithBeacon';

/**
 * The `/tutorial` route, which is only an entry point.
 *
 * It seeds the demo store and `TutorialProvider` sends the user back to the home
 * page once that is done. The tour itself lives at the app root, since it has to
 * outlive this route the moment it navigates anywhere.
 */
function TutorialEntry() {
	const { t } = useTranslation();
	const { status, startTutorial } = useTutorialContext();

	useEffect(() => {
		if (status === TutorialStatus.OFF) {
			void startTutorial();
		}
	}, [status, startTutorial]);

	// Landing here with a tour already running — a bookmark, or the back button —
	// should not restart it.
	if (status === TutorialStatus.RUNNING) {
		return <Navigate to="/" replace />;
	}

	return <>
		<h1>{titleWithBeacon(t('home.title'))}</h1>
		<p>{t('tutorial.loading')}</p>
	</>;
}

export default TutorialEntry;
