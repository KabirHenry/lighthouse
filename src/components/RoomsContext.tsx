import type React from 'react';
import { useEffect, useState } from 'react';

import RoomsStateContext, { type RoomsContextValue } from '../context/roomsStateContext';
import useHomesContext from '../hooks/useHomesContext';
import { getHomeService, type HomeService, type Room } from '../services';

function RoomsProvider({ children }: { children: React.ReactNode }) {
	const { home } = useHomesContext();
	const [homeService, setHomeService] = useState<HomeService | null>(null);
	const [rooms, setRooms] = useState<Room[]>([]);

	const isLoaded = homeService !== null && home !== null;

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

	useEffect(() => {
		let isCancelled = false;

		const loadService = async () => {
			const service = await getHomeService();
			if (!isCancelled) {
				setHomeService(service);
			}
		};

		void loadService();

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

	const roomsState: RoomsContextValue = {
		isLoaded,
		rooms,
		addRoom,
	};

	return <RoomsStateContext.Provider value={roomsState}>{children}</RoomsStateContext.Provider>;
}

export default RoomsProvider;
