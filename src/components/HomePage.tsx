import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import HomeIcon from '../assets/home.svg';
import Button from './Button';
import { IconLink } from './IconLink';
import { titleWithBeacon } from './titleWithBeacon';

function HomePage() {
	const { t } = useTranslation();
	return <>
		<div className="align-self-end">
			<IconLink to="/homes" src={HomeIcon} alt={t('home.home')} />
		</div>
		<h1>{titleWithBeacon(t('home.title'))}</h1>
		<div className="main-buttons d-flex flex-column align-items-center">
			<Link to="/items">
				<Button>{t('pages.items')}</Button>
			</Link>
			<Link to="/rooms">
				<Button>{t('pages.rooms')}</Button>
			</Link>
			<Link to="/reminders">
				<Button disabled>{t('pages.reminders')}</Button>
			</Link>
			<Link to="/backup">
				<Button disabled>{t('pages.backup')}</Button>
			</Link>
			<Link to="/about">
				<Button>{t('pages.about')}</Button>
			</Link>
		</div>
	</>;
}

export default HomePage;