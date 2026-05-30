import { Link } from 'react-router';

import HomeSelector from './HomeSelector';

function HomePage() {
	return <>
		<HomeSelector/>
		<h1>Lighthouse</h1>
		<h2>Welcome to Lighthouse!</h2>
		<ul className="">
			<li><Link to="/items">Items</Link></li>
			<li><Link to="/rooms">Rooms</Link></li>
			<li><Link to="/backup">Backup</Link></li>
			<li><Link to="/about">About</Link></li>
		</ul>
	</>;
}

export default HomePage;