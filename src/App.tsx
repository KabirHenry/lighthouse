import { Route, Routes } from 'react-router';
import { Container } from 'react-bootstrap';

import './App.css';

import HomesProvider from './components/HomesContext';
import HomePage from './components/HomePage';
import NotFound from './components/NotFound';
import Items from './components/Items';
import Rooms from './components/Rooms';
import Backup from './components/Backup';
import About from './components/About';

function App() {
	return (
		<HomesProvider>
			<Container as={'main'} className="py-4 px-3 mx-auto">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/items" element={<Items/>} />
					<Route path="/rooms" element={<Rooms/>} />
					<Route path="/backup" element={<Backup/>} />
					<Route path="/about" element={<About/>} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Container>
		</HomesProvider>
	);
}

export default App;
