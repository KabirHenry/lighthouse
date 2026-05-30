import { Route, Routes } from 'react-router';
import { Container } from 'react-bootstrap';

import './App.css';

import HomePage from './components/HomePage';
import NotFound from './components/NotFound';
import Items from './components/Items';
import HomesProvider from './components/HomesContext';

function App() {
	return (
		<HomesProvider>
			<Container as={'main'} className="py-4 px-3 mx-auto">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/items" element={<Items/>} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Container>
		</HomesProvider>
	);
}

export default App;
