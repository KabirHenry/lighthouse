import { Route, Routes } from 'react-router';
import { Container } from 'react-bootstrap';

import './App.css';

import HomesProvider from './components/HomesContext';
import Homes from './components/Homes';
import AddHome from './components/modals/AddHome';
import EditHome from './components/modals/EditHome';
import DeleteHome from './components/modals/DeleteHome';
import HomePage from './components/HomePage';
import NotFound from './components/NotFound';
import Items from './components/Items';
import Rooms from './components/Rooms';
import AddRoom from './components/modals/AddRoom';
import EditRoom from './components/modals/EditRoom';
import DeleteRoom from './components/modals/DeleteRoom';
import Locations from './components/Locations';
import AddLocation from './components/modals/AddLocation';
import EditLocation from './components/modals/EditLocation';
import DeleteLocation from './components/modals/DeleteLocation';
import Reminders from './components/Reminders';
import Backup from './components/Backup';
import About from './components/About';

function App() {
	return (
		<HomesProvider>
			<Container as={'main'} className="d-flex flex-column align-items-center">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/items" element={<Items/>} />
					<Route path="/rooms" element={<Rooms/>}>
						<Route path="new" element={<AddRoom/>} />
						<Route path=":id" element={<EditRoom/>} />
						<Route path=":id/delete" element={<DeleteRoom/>} />
					</Route>
					<Route path="/locations" element={<Locations/>}>
						<Route path="new" element={<AddLocation/>} />
						<Route path=":id" element={<EditLocation/>} />
						<Route path=":id/delete" element={<DeleteLocation/>} />
					</Route>
					<Route path="/reminders" element={<Reminders/>} />
					<Route path="/backup" element={<Backup/>} />
					<Route path="/about" element={<About/>} />
					<Route path="/homes" element={<Homes/>}>
						<Route path="new" element={<AddHome/>} />
						<Route path=":id" element={<EditHome/>} />
						<Route path=":id/delete" element={<DeleteHome/>} />
					</Route>
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Container>
		</HomesProvider>
	);
}

export default App;
