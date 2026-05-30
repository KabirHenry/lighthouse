import { Route, Routes } from 'react-router';
import { Container } from 'react-bootstrap';

import './App.css';

import Home from './components/Home';
import NotFound from './components/NotFound';
import Items from './components/Items';

function App() {
	return (
		<Container as={'main'} className="py-4 px-3 mx-auto">
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/items" element={<Items/>} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Container>
	);
}

export default App;
