import { Route, Routes } from 'react-router';
import { Container } from 'react-bootstrap';

import './App.css';

import HomePage from './components/Home';
import NotFound from './components/NotFound';
import Items from './components/Items';
import { useCallback, useEffect, useState } from 'react';
import { getHomeService, type Home, type HomeService } from './services';

function App() {
	const [homeService, setHomeService] = useState<HomeService | null>(null);
	const [home, setHome] = useState<Home | null>(null);
	const [homes, setHomes] = useState<Home[]>([]);

	const isLoaded = homeService !== null && home !== null;

	useEffect(() => {
		(async () => {
			if (!homeService) {
				const service = await getHomeService();
				setHomeService(service);
				return;
			}

			const allHomes = await homeService.homes();
			setHomes(allHomes.homes);
			setHome(allHomes.currentHome);
		})();
	}, [homeService]);

	const reloadHomes = useCallback(async () => {
		if (!homeService) {
			return;
		}

		const allHomes = await homeService.homes();
		setHomes(allHomes.homes);
		setHome(allHomes.currentHome);
	}, [homeService]);

	const addHome = useCallback(async (name: string) => {
		if (!homeService) {
			return;
		}

		await homeService.addHome(name);
		await reloadHomes();
	}, [homeService, reloadHomes]);

	const deleteHome = useCallback(async (id: number) => {
		if (!homeService) {
			return;
		}

		await homeService.deleteHome(id);
		await reloadHomes();
	}, [homeService, reloadHomes]);

	return (
		<Container as={'main'} className="py-4 px-3 mx-auto">
			<Routes>
				<Route path="/" element={
					<HomePage
						isLoaded={isLoaded}
						home={home}
						homes={homes}
						addHome={addHome}
						deleteHome={deleteHome}
					/>
				} />
				<Route path="/items" element={<Items/>} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Container>
	);
}

export default App;
