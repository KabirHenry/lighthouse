import { useContext } from 'react';

import TutorialStateContext from '../context/tutorialContext';

function useTutorialContext() {
	const context = useContext(TutorialStateContext);
	if (!context) {
		throw new Error('useTutorialContext must be used within a TutorialProvider');
	}

	return context;
}

export default useTutorialContext;
