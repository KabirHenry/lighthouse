import { Link } from 'react-router';

function Welcome() {
	return <>
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