import { Link } from 'react-router';

import type { Home } from '../services';
import HomeSelector from './HomeSelector';

function Welcome({
	isLoaded,
	home,
	homes,
}: {
	isLoaded: boolean;
	home: Home | null;
	homes: Home[];
	addHome: (name: string) => Promise<void>;
	deleteHome: (id: number) => Promise<void>;
}) {
	return <>
		<HomeSelector
			isLoaded={isLoaded}
			home={home}
			homes={homes}
		/>
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

export default Welcome;