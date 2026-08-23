import { createContext } from 'react';

import type { Home, HomeID, LocationID, LocationInfo, RoomID, RoomInfo } from '../services';

export type HomesContextValue = {
	isLoaded: boolean;
	home: Home | null;
	homes: Home[];
	rooms: RoomInfo[];
	locations: LocationInfo[];
	addHome: (name: string, description?: string) => Promise<HomeID | undefined>;
	updateHome: (id: HomeID, name: string, description?: string) => Promise<void>;
	deleteHome: (id: HomeID) => Promise<void>;
	setActiveHome: (id: HomeID) => Promise<void>;
	addRoom: (name: string, description?: string) => Promise<RoomID | undefined>;
	deleteRoom: (id: RoomID) => Promise<void>;
	loadLocations: (roomID: RoomID) => Promise<void>;
	addLocation: (name: string, description?: string) => Promise<LocationID | undefined>;
	deleteLocation: (id: LocationID) => Promise<void>;
};

const HomesStateContext = createContext<HomesContextValue | null>(null);

export default HomesStateContext;