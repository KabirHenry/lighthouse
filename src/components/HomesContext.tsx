import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import HomesStateContext, { type HomesContextValue } from '../context/homesStateContext';
import {
	getHomeService,
	type Home,
	type HomeID,
	type HomeService,
	type ItemID,
	type ItemInfo,
	type LocationID,
	type LocationInfo,
	type LocationRoomInfo,
	type RoomID,
	type RoomInfo,
} from '../services';

function HomesProvider({ children }: { children: React.ReactNode }) {
	const [homeService, setHomeService] = useState<HomeService | null>(null);
	const [home, setHome] = useState<Home | null>(null);
	const [homes, setHomes] = useState<Home[]>([]);
	const [rooms, setRooms] = useState<RoomInfo[]>([]);
	const [locations, setLocations] = useState<LocationInfo[]>([]);
	const [locationsRoomID, setLocationsRoomID] = useState<RoomID | null>(null);
	const [allItems, setAllItems] = useState<ItemInfo[]>([]);
	const [allLocations, setAllLocations] = useState<LocationRoomInfo[]>([]);

	const isLoaded = homeService !== null && home !== null;

	const reloadHomes = async () => {
		if (!homeService) {
			return;
		}

		const allHomes = await homeService.homes();
		setHomes(allHomes.homes);
		setHome(allHomes.currentHome);
	};

	const addHome = async (name: string, description?: string) => {
		if (!homeService) {
			return undefined;
		}

		const id = await homeService.addHome(name, description);
		await reloadHomes();
		return id;
	};

	const updateHome = async (id: HomeID, name: string, description?: string) => {
		if (!homeService) {
			return;
		}

		await homeService.updateHome(id, { name, description });
		await reloadHomes();
	};

	const deleteHome = async (id: HomeID) => {
		if (!homeService) {
			return;
		}

		await homeService.deleteHome(id);
		await reloadHomes();
	};

	const setActiveHome = async (id: HomeID) => {
		if (!homeService) {
			return;
		}

		await homeService.setActiveHome(id);
		await reloadHomes();
	};

	const reloadRooms = async (service: HomeService | null = homeService) => {
		if (!service || !home) {
			return;
		}

		setRooms(await service.rooms(home.id));
	};

	const addRoom = async (name: string, description?: string) => {
		if (!homeService || !home) {
			return undefined;
		}

		const id = await homeService.addRoom(home.id, name, description);
		await reloadRooms();
		return id;
	};

	const updateRoom = async (id: RoomID, name: string, homeID: HomeID, description?: string) => {
		if (!homeService) {
			return;
		}

		await homeService.updateRoom(id, { name, homeID, description });
		await reloadRooms();
	};

	const deleteRoom = async (id: RoomID) => {
		if (!homeService) {
			return;
		}

		await homeService.deleteRoom(id);
		await reloadRooms();
	};

	const loadLocations = useCallback(async (roomID: RoomID) => {
		setLocationsRoomID(roomID);
		if (!homeService) {
			return;
		}

		setLocations(await homeService.locations(roomID));
	}, [homeService]);

	const addLocation = async (name: string, description?: string) => {
		if (!homeService || locationsRoomID === null) {
			return undefined;
		}

		const id = await homeService.addLocation(locationsRoomID, name, description);
		await Promise.all([loadLocations(locationsRoomID), reloadRooms()]);
		return id;
	};

	const updateLocation = async (id: LocationID, name: string, roomID: RoomID, description?: string) => {
		if (!homeService) {
			return;
		}

		await homeService.updateLocation(id, { name, roomID, description });
		await Promise.all([
			locationsRoomID === null ? Promise.resolve() : loadLocations(locationsRoomID),
			reloadRooms(),
		]);
	};

	const deleteLocation = async (id: LocationID) => {
		if (!homeService || locationsRoomID === null) {
			return;
		}

		await homeService.deleteLocation(id);
		await Promise.all([loadLocations(locationsRoomID), reloadRooms()]);
	};

	const loadAllItems = useCallback(async () => {
		if (!homeService || !home) {
			return;
		}

		const roomInfos = await homeService.rooms(home.id);
		const result: ItemInfo[] = [];
		for (const { room } of roomInfos) {
			const locationInfos = await homeService.locations(room.id);
			for (const { location } of locationInfos) {
				const locationItems = await homeService.items(location.id);
				for (const item of locationItems) {
					result.push({ item, location, room });
				}
			}
		}

		setAllItems(result);
	}, [homeService, home]);

	const loadAllLocations = useCallback(async () => {
		if (!homeService || !home) {
			return;
		}

		const roomInfos = await homeService.rooms(home.id);
		const result: LocationRoomInfo[] = [];
		for (const { room } of roomInfos) {
			const locationInfos = await homeService.locations(room.id);
			for (const { location, itemCount } of locationInfos) {
				result.push({ location, room, itemCount });
			}
		}

		setAllLocations(result);
	}, [homeService, home]);

	const refreshAfterItemChange = async () => {
		await Promise.all([
			locationsRoomID === null ? Promise.resolve() : loadLocations(locationsRoomID),
			loadAllItems(),
			loadAllLocations(),
			reloadRooms(),
		]);
	};

	const addItem = async (locationID: LocationID, name: string, description?: string) => {
		if (!homeService) {
			return undefined;
		}

		const id = await homeService.addItem(locationID, name, description);
		await refreshAfterItemChange();
		return id;
	};

	const updateItem = async (id: ItemID, name: string, locationID: LocationID, description?: string) => {
		if (!homeService) {
			return;
		}

		await homeService.updateItem(id, { name, locationID, description });
		await refreshAfterItemChange();
	};

	const deleteItem = async (id: ItemID) => {
		if (!homeService) {
			return;
		}

		await homeService.deleteItem(id);
		await refreshAfterItemChange();
	};

	useEffect(() => {
		let isCancelled = false;

		const loadHomes = async () => {
			const service = await getHomeService();
			if (isCancelled) {
				return;
			}

			setHomeService(service);

			const allHomes = await service.homes();
			if (isCancelled) {
				return;
			}

			setHomes(allHomes.homes);
			setHome(allHomes.currentHome);
		};

		void loadHomes();

		return () => {
			isCancelled = true;
		};
	}, []);

	useEffect(() => {
		let isCancelled = false;

		const loadRooms = async () => {
			if (!homeService || !home) {
				return;
			}

			const allRooms = await homeService.rooms(home.id);
			if (!isCancelled) {
				setRooms(allRooms);
			}
		};

		void loadRooms();

		return () => {
			isCancelled = true;
		};
	}, [homeService, home]);

	const homesState: HomesContextValue = {
		isLoaded,
		home,
		homes,
		rooms,
		locations,
		locationsRoomID,
		allItems,
		allLocations,
		loadAllLocations,
		addHome,
		updateHome,
		deleteHome,
		setActiveHome,
		addRoom,
		updateRoom,
		deleteRoom,
		loadLocations,
		addLocation,
		updateLocation,
		deleteLocation,
		loadAllItems,
		addItem,
		updateItem,
		deleteItem,
	};

	return <HomesStateContext.Provider value={homesState}>{children}</HomesStateContext.Provider>;
}

export default HomesProvider;