import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import PlusIcon from '../assets/plus.svg';
// import DustbinIcon from '../assets/dustbin.svg';
import BackRightIcon from '../assets/back-right.svg';
// import PencilIcon from '../assets/pencil.svg';
// import Button from './Button';
import { IconLink } from './IconLink';
import LightHousePixel from './LightHousePixel';
import useHomesContext from '../hooks/useHomesContext';

function Rooms() {
	const { t } = useTranslation();
	const { home: activeHome } = useHomesContext();

	return <>
		<div className="align-self-end">
			<IconLink to="/" src={BackRightIcon} alt={t('home.back')} className='bare' />
		</div>
		<h1 className="main-title">
			<div className='main-title-actions-before'>
				<span className="lighthouse-anchor">
					<LightHousePixel style={{ top: '2px', left: -3 }} />
				</span>
			</div>
			<span className="main-title-text">{t('pages.rooms')}</span>
			<div className="main-title-actions-after">
				<IconLink to="/rooms/new" src={PlusIcon} alt={t('rooms.add')} scale='65%' />
			</div>
			<h2>
				{activeHome?.name}
			</h2>
		</h1>
		<div className="main-buttons main-list d-flex flex-column align-items-center">
			
		</div>
		<Outlet/>
	</>;
}

export default Rooms;