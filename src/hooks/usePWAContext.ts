import { useContext } from 'react';

import PWAStateContext from '../context/pwaContext';

function usePWAContext() {
	const context = useContext(PWAStateContext);
	if (!context) {
		throw new Error('usePWAContext must be used within a PWAProvider');
	}

	return context;
}

export default usePWAContext;
