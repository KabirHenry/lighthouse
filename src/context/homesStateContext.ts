import { createContext } from 'react';

import type { Home, HomeID, Item, ItemID, LocationID, LocationInfo, RoomID, RoomInfo } from '../services';

export type HomesContextValue = {
	isLoaded: boolean;
	home: Home | null;
	homes: Home[];
	rooms: RoomInfo[];
	locations: LocationInfo[];
	items: Item[];
	addHome: (name: string, description?: string) => Promise<HomeID | undefined>;
	updateHome: (id: HomeID, name: string, description?: string) => Promise<void>;
	deleteHome: (id: HomeID) => Promise<void>;
	setActiveHome: (id: HomeID) => Promise<void>;
	addRoom: (name: string, description?: string) => Promise<RoomID | undefined>;
	updateRoom: (id: RoomID, name: string, homeID: HomeID, description?: string) => Promise<void>;
	deleteRoom: (id: RoomID) => Promise<void>;
	loadLocations: (roomID: RoomID) => Promise<void>;
	addLocation: (name: string, description?: string) => Promise<LocationID | undefined>;
	updateLocation: (id: LocationID, name: string, roomID: RoomID, description?: string) => Promise<void>;
	deleteLocation: (id: LocationID) => Promise<void>;
	loadItems: (locationID: LocationID) => Promise<void>;
	addItem: (name: string, description?: string) => Promise<ItemID | undefined>;
	updateItem: (id: ItemID, name: string, locationID: LocationID, description?: string) => Promise<void>;
	deleteItem: (id: ItemID) => Promise<void>;
};

const HomesStateContext = createContext<HomesContextValue | null>(null);

export default HomesStateContext;