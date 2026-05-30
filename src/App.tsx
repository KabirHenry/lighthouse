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

			const currentHome = await homeService.currentHome();
			setHome(currentHome);

			const allHomes = await homeService.homes();
			setHomes(allHomes.homes);
		})();
	}, [homeService]);

	const addHome = useCallback(async (name: string) => {
		if (!homeService) {
			return;
		}

		const newHome = await homeService.addHome(name);
		if (newHome) {
			setHomes((prev) => [...prev, newHome]);
			setHome(newHome);
		}
	}, [homeService]);

	return (
		<Container as={'main'} className="py-4 px-3 mx-auto">
			<Routes>
				<Route path="/" element={<HomePage isLoaded={isLoaded} home={home} homes={homes} addHome={addHome} />} />
				<Route path="/items" element={<Items/>} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Container>
	);
}

export default App;
