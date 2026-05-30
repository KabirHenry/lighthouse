import { Route, Routes } from 'react-router';
import { Container } from 'react-bootstrap';

import './App.css';
import NotFound from './components/NotFound';
import Welcome from './components/Welcome';

function App() {
	return (
		<Container as={'main'} className="py-4 px-3 mx-auto">
			<Routes>
				<Route path="/" element={<Welcome />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Container>
	);
}

export default App;
