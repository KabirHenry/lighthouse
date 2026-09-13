import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import HomeIcon from '../assets/home.svg';
import { TourTarget } from '../constants';
import Button from './Button';
import { IconLink } from './IconLink';
import { titleWithBeacon } from './titleWithBeacon';

function HomePage() {
	const { t } = useTranslation();
	return <>
		<div className="align-self-end">
			<IconLink to="/homes" src={HomeIcon} alt={t('home.home')} dataTour={TourTarget.HOME_HOMES} />
		</div>
		<h1>{titleWithBeacon(t('home.title'))}</h1>
		<div className="main-buttons d-flex flex-column align-items-center">
			<Link to="/items">
				<Button dataTour={TourTarget.HOME_ITEMS}>{t('pages.items')}</Button>
			</Link>
			<Link to="/rooms">
				<Button dataTour={TourTarget.HOME_ROOMS}>{t('pages.rooms')}</Button>
			</Link>
			<Link to="">
				<Button disabled snippet={t('home.comingSoon')}>{t('pages.reminders')}</Button>
			</Link>
			<Link to="/backup">
				<Button dataTour={TourTarget.HOME_BACKUP}>{t('pages.backup')}</Button>
			</Link>
			{/* `replace`: the tour starts and ends on this page, and shouldn't leave an entry behind. */}
			<Link to="/tutorial" replace>
				<Button dataTour={TourTarget.HOME_TUTORIAL}>{t('pages.tutorial')}</Button>
			</Link>
			<Link to="/about">
				<Button>{t('pages.about')}</Button>
			</Link>
		</div>
	</>;
}

export default HomePage;