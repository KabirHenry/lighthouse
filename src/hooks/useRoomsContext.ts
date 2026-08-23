import { useContext } from 'react';

import RoomsStateContext from '../context/roomsStateContext';

function useRoomsContext() {
	const context = useContext(RoomsStateContext);
	if (!context) {
		throw new Error('useRoomsContext must be used within a RoomsProvider');
	}

	return context;
}

export default useRoomsContext;
