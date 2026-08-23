import { createContext } from 'react';

import type { Home, HomeID, RoomID, RoomInfo } from '../services';

export type HomesContextValue = {
	isLoaded: boolean;
	home: Home | null;
	homes: Home[];
	rooms: RoomInfo[];
	addHome: (name: string, description?: string) => Promise<HomeID | undefined>;
	updateHome: (id: HomeID, name: string, description?: string) => Promise<void>;
	deleteHome: (id: HomeID) => Promise<void>;
	setActiveHome: (id: HomeID) => Promise<void>;
	addRoom: (name: string, description?: string) => Promise<RoomID | undefined>;
};

const HomesStateContext = createContext<HomesContextValue | null>(null);

export default HomesStateContext;