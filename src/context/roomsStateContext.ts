import { createContext } from 'react';

import type { RoomID, RoomInfo } from '../services';

export type RoomsContextValue = {
	isLoaded: boolean;
	rooms: RoomInfo[];
	addRoom: (name: string, description?: string) => Promise<RoomID | undefined>;
};

const RoomsStateContext = createContext<RoomsContextValue | null>(null);

export default RoomsStateContext;
