import { useContext } from 'react';

import HomesStateContext from '../context/homesStateContext';

function useHomesContext() {
	const context = useContext(HomesStateContext);
	if (!context) {
		throw new Error('useHomesContext must be used within a HomesProvider');
	}

	return context;
}

export default useHomesContext;