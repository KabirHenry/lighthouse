import type React from 'react';
import { useEffect, useState } from 'react';

import HomesStateContext from '../context/homesStateContext';
import { getHomeService, type Home, type HomeService } from '../services';

function HomesProvider({ children }: { children: React.ReactNode }) {
	const [homeService, setHomeService] = useState<HomeService | null>(null);
	const [home, setHome] = useState<Home | null>(null);
	const [homes, setHomes] = useState<Home[]>([]);

	const isLoaded = homeService !== null && home !== null;

	const reloadHomes = async (service?: HomeService) => {
		const homeServiceInstance = service ?? homeService;
		if (!homeServiceInstance) {
			return;
		}

		const allHomes = await homeServiceInstance.homes();
		setHomes(allHomes.homes);
		setHome(allHomes.currentHome);
	};

	const addHome = async (name: string) => {
		if (!homeService) {
			return;
		}

		await homeService.addHome(name);
		await reloadHomes(homeService);
	};

	const deleteHome = async (id: number) => {
		if (!homeService) {
			return;
		}

		await homeService.deleteHome(id);
		await reloadHomes(homeService);
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

	const homesState = {
		isLoaded,
		home,
		homes,
		reloadHomes,
		addHome,
		deleteHome,
	};

	return <HomesStateContext.Provider value={homesState}>{children}</HomesStateContext.Provider>;
}

export default HomesProvider;