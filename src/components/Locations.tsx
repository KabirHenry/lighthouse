import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useSearchParams } from 'react-router';

import PlusIcon from '../assets/plus.svg';
import BackLeftIcon from '../assets/back-left.svg';
import DustbinIcon from '../assets/dustbin.svg';
import PencilIcon from '../assets/pencil.svg';
import DrawerIcon from '../assets/drawer.svg';
import Button from './Button';
import { IconLink } from './IconLink';
import LightHousePixel from './LightHousePixel';
import useHomesContext from '../hooks/useHomesContext';
import useSmartBack from '../hooks/useSmartBack';
import type { RoomID } from '../services';

import './SecondaryList.css';

function Locations() {
	const { t } = useTranslation();
	const { home, rooms, locations, loadLocations } = useHomesContext();
	const [searchParams] = useSearchParams();
	const roomID = Number(searchParams.get('room')) as RoomID;
	const room = rooms.find((info) => info.room.id === roomID)?.room;
	const goBack = useSmartBack('/rooms');

	useEffect(() => {
		void loadLocations(roomID);
	}, [loadLocations, roomID]);

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
			<span className="main-title-text">{t('pages.locations')}</span>
			<div className="main-title-actions-after">
				<IconLink to={`/locations/new?room=${roomID}`} src={PlusIcon} alt={t('locations.add')} scale='65%' />
			</div>
			<div className="subheading">
				{room?.name}, {home?.name}
			</div>
		</h1>
		<div className="main-buttons secondary-list main-list d-flex flex-column align-items-center">
			{
				locations.map(({ location, itemCount }) => (
					<div className="main-list-item" key={location.id}>
						<div className="main-list-item-actions-before">
							<IconLink
								to={`/locations/${location.id}/delete?room=${roomID}`}
								src={DustbinIcon}
								scale='70%'
								alt={t('locations.delete')}
								className='bare d-none d-md-block'
							/>
							<IconLink
								src={DrawerIcon}
								alt={t('homes.delete')}
								className='bare secondary-list-icon'
							/>
						</div>
						<div className='secondary-list-data'>
							<Link to={`/items?via=locations&location=${location.id}&room=${roomID}`}>
								<Button>{location.name}</Button>
							</Link>
							<div>{itemCount} items</div>
						</div>
						<div className="main-list-item-actions-after">
							<IconLink
								to={`/locations/${location.id}/delete?room=${roomID}`}
								src={DustbinIcon}
								alt={t('locations.delete')}
								className='bare d-md-none'
							/>
							<IconLink
								to={`/locations/${location.id}?room=${roomID}`}
								src={PencilIcon}
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

export default Locations;
