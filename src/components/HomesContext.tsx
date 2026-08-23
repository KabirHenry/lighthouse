import type React from 'react';
import { useEffect, useState } from 'react';

import HomesStateContext, { type HomesContextValue } from '../context/homesStateContext';
import { getHomeService, type Home, type HomeID, type HomeService } from '../services';

function HomesProvider({ children }: { children: React.ReactNode }) {
	const [homeService, setHomeService] = useState<HomeService | null>(null);
	const [home, setHome] = useState<Home | null>(null);
	const [homes, setHomes] = useState<Home[]>([]);

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

	const deleteHome = async (id: HomeID) => {
		if (!homeService) {
			return;
		}

		await homeService.deleteHome(id);
		await reloadHomes();
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

	const homesState: HomesContextValue = {
		isLoaded,
		home,
		homes,
		addHome,
		deleteHome,
	};

	return <HomesStateContext.Provider value={homesState}>{children}</HomesStateContext.Provider>;
}

export default HomesProvider;