import { createContext } from 'react';

import type { Room, RoomID } from '../services';

export type RoomsContextValue = {
	isLoaded: boolean;
	rooms: Room[];
	addRoom: (name: string, description?: string) => Promise<RoomID | undefined>;
};

const RoomsStateContext = createContext<RoomsContextValue | null>(null);

export default RoomsStateContext;
