import { useTranslation } from 'react-i18next';
import { Outlet, Link } from 'react-router';

import PlusIcon from '../assets/plus.svg';
import BackLeftIcon from '../assets/back-left.svg';
import DustbinIcon from '../assets/dustbin.svg';
import PencilIcon from '../assets/pencil.svg';
import RoomIcon from '../assets/room.svg';
import Button from './Button';
import { IconLink } from './IconLink';
import LightHousePixel from './LightHousePixel';
import useHomesContext from '../hooks/useHomesContext';
import useSmartBack from '../hooks/useSmartBack';

import './Rooms.css';

function Rooms() {
	const { t } = useTranslation();
	const { home: activeHome, rooms } = useHomesContext();
	const goBack = useSmartBack('/');

	return <>
		<div className="align-self-end">
			<IconLink onClick={goBack} src={BackLeftIcon} alt={t('home.back')} className='bare' />
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
			<div className="subheading">
				{activeHome?.name}
			</div>
		</h1>
		<div className="main-buttons rooms-items main-list d-flex flex-column align-items-center">
			{
				rooms.map(({ room, locationCount, itemCount }) => (
					<div className="main-list-item" key={room.id}>
						<div className="main-list-item-actions-before">
							<IconLink
								to={`/rooms/${room.id}/delete`}
								src={DustbinIcon}
								scale='70%'
								alt={t('rooms.delete')}
								className='bare d-none d-md-block'
							/>
							<IconLink
								to={`/rooms/${room.id}/upload`}
								src={RoomIcon}
								alt={t('homes.delete')}
								className='bare room-icon'
							/>
						</div>
						<div className='room-data'>
							<Link to={`/locations?room=${room.id}`}>
								<Button>{room.name}</Button>
							</Link>
							<div className='mt-1'>{locationCount} locations</div>
							<div>{itemCount} items</div>
						</div>
						<div className="main-list-item-actions-after">
							<IconLink
								to={`/rooms/${room.id}/delete`}
								src={DustbinIcon}
								// scale='50%'
								alt={t('rooms.delete')}
								className='bare d-md-none'
							/>
							<IconLink
								to={`/rooms/${room.id}`}
								src={PencilIcon}
								// scale='60%'
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