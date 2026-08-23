import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import PlusIcon from '../assets/plus.svg';
import BackRightIcon from '../assets/back-right.svg';
import DustbinIcon from '../assets/dustbin.svg';
import PencilIcon from '../assets/pencil.svg';
import Button from './Button';
import { IconLink } from './IconLink';
import LightHousePixel from './LightHousePixel';
import useHomesContext from '../hooks/useHomesContext';
import useRoomsContext from '../hooks/useRoomsContext';

function Rooms() {
	const { t } = useTranslation();
	const { home: activeHome } = useHomesContext();
	const { rooms } = useRoomsContext();

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
			{
				rooms.map(room => (
					<div className="main-list-item" key={room.id}>
						<div className="main-list-item-actions-before">
							<IconLink
								to={`/rooms/${room.id}/delete`}
								src={DustbinIcon}
								scale='70%'
								alt={t('homes.delete')}
								className='bare d-none d-md-block'
							/>
						</div>
						<Button className='bare'>
							{room.name}
						</Button>
						<div className="main-list-item-actions-after">
							<IconLink
								to={`/rooms/${room.id}/delete`}
								src={DustbinIcon}
								scale='70%'
								alt={t('homes.delete')}
								className='bare d-md-none'
							/>
							<IconLink
								to={`/rooms/${room.id}`}
								src={PencilIcon}
								scale='80%'
								alt={t('homes.edit')}
								className='bare'
							/>
						</div>
					</div>
				))
			}
		</div>
		<Outlet/>
	</>;
}

export default Rooms;