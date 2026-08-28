import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useSearchParams } from 'react-router';

import PlusIcon from '../assets/plus.svg';
import BackLeftIcon from '../assets/back-left.svg';
import DustbinIcon from '../assets/dustbin.svg';
import PencilIcon from '../assets/pencil.svg';
import ItemIcon from '../assets/item.svg';
import Button from './Button';
import { IconLink } from './IconLink';
import LightHousePixel from './LightHousePixel';
import useHomesContext from '../hooks/useHomesContext';
import useSmartBack from '../hooks/useSmartBack';
import type { LocationID } from '../services';

import './SecondaryList.css';

function Items() {
	const { t } = useTranslation();
	const { home, allItems, loadAllItems } = useHomesContext();
	const [searchParams] = useSearchParams();
	const locationParam = searchParams.get('location');
	const locationID = locationParam === null ? null : (Number(locationParam) as LocationID);

	const fromLocations = searchParams.get('via') === 'locations';
	const roomParam = searchParams.get('room');

	const scoped = locationID === null
		? allItems
		: allItems.filter((info) => info.location.id === locationID);

	const goBack = useSmartBack(fromLocations ? `/locations?room=${roomParam}` : '/');

	useEffect(() => {
		void loadAllItems();
	}, [loadAllItems]);

	const search = searchParams.toString();
	const query = search ? `?${search}` : '';

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
				<IconLink to={`/items/new${query}`} src={PlusIcon} alt={t('items.add')} scale='65%' />
			</div>
			<div className="subheading">
				{home?.name}
			</div>
		</h1>
		<div className="main-buttons secondary-list main-list d-flex flex-column align-items-center">
			{
				scoped.map(({ item, location, room }) => (
					<div className="main-list-item" key={item.id}>
						<div className="main-list-item-actions-before">
							<IconLink
								to={`/items/${item.id}/delete${query}`}
								src={DustbinIcon}
								scale='70%'
								alt={t('items.delete')}
								className='bare d-none d-md-block'
							/>
							<IconLink
								src={ItemIcon}
								alt={t('items.delete')}
								className='bare secondary-list-icon'
							/>
						</div>
						<div className='secondary-list-data'>
							<Button>{item.name}</Button>
							<div>{location.name}, {room.name}</div>
						</div>
						<div className="main-list-item-actions-after">
							<IconLink
								to={`/items/${item.id}/delete${query}`}
								src={DustbinIcon}
								alt={t('items.delete')}
								className='bare d-md-none'
							/>
							<IconLink
								to={`/items/${item.id}${query}`}
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
