import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useSearchParams } from 'react-router';

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
import type { LocationID } from '../services';

import './Rooms.css';

function Items() {
	const { t } = useTranslation();
	const { home, rooms, locations, items, loadItems } = useHomesContext();
	const [searchParams] = useSearchParams();
	const locationID = Number(searchParams.get('location')) as LocationID;
	const location = locations.find((info) => info.location.id === locationID)?.location;
	const room = rooms.find((info) => info.room.id === location?.roomID)?.room;
	const goBack = useSmartBack(`/locations?room=${location?.roomID}`);

	useEffect(() => {
		void loadItems(locationID);
	}, [loadItems, locationID]);

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
			<span className="main-title-text">{t('pages.items')}</span>
			<div className="main-title-actions-after">
				<IconLink to={`/items/new?location=${locationID}`} src={PlusIcon} alt={t('items.add')} scale='65%' />
			</div>
			<div className="subheading">
				{[location?.name, room?.name, home?.name].filter(Boolean).join(', ')}
			</div>
		</h1>
		<div className="main-buttons rooms-items main-list d-flex flex-column align-items-center">
			{
				items.map((item) => (
					<div className="main-list-item" key={item.id}>
						<div className="main-list-item-actions-before">
							<IconLink
								to={`/items/${item.id}/delete?location=${locationID}`}
								src={DustbinIcon}
								scale='70%'
								alt={t('items.delete')}
								className='bare d-none d-md-block'
							/>
							<IconLink
								src={RoomIcon}
								alt={t('items.delete')}
								className='bare room-icon'
							/>
						</div>
						<div className='room-data'>
							<Button>{item.name}</Button>
							{item.description && <div>{item.description}</div>}
						</div>
						<div className="main-list-item-actions-after">
							<IconLink
								to={`/items/${item.id}/delete?location=${locationID}`}
								src={DustbinIcon}
								alt={t('items.delete')}
								className='bare d-md-none'
							/>
							<IconLink
								to={`/items/${item.id}?location=${locationID}`}
								src={PencilIcon}
								alt={t('items.edit')}
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

export default Items;
