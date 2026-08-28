import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useSearchParams } from 'react-router';

import PlusIcon from '../assets/plus.svg';
import SortFilterIcon from '../assets/sort-filter.svg';
import BackLeftIcon from '../assets/back-left.svg';
import DustbinIcon from '../assets/dustbin.svg';
import PencilIcon from '../assets/pencil.svg';
import ItemIcon from '../assets/item.svg';
import Button from './Button';
import { IconLink } from './IconLink';
import { SEPARATOR } from '../constants';
import useHomesContext from '../hooks/useHomesContext';
import useSmartBack from '../hooks/useSmartBack';
import { parseIDList } from '../utils/params';
import type { LocationID, RoomID } from '../services';

import './SecondaryList.css';

function Items() {
	const { t } = useTranslation();
	const { home, allItems, loadAllItems } = useHomesContext();
	const [searchParams] = useSearchParams();

	const fromLocations = searchParams.get('via') === 'locations';
	const roomParam = searchParams.get('room');

	// `location=` is a single-location drill-down and is only honoured when we
	// arrived here from the Locations page (`via=locations`).
	const locationParam = searchParams.get('location');
	const viaLocationID = fromLocations && locationParam !== null
		? (Number(locationParam) as LocationID)
		: null;

	const roomsFilter = parseIDList<RoomID>(searchParams.get('rooms'));
	const locationsFilter = parseIDList<LocationID>(searchParams.get('locations'));
	const searchQuery = (searchParams.get('search') ?? '').trim();
	const searchTerm = searchQuery.toLowerCase();

	const scoped = (() => {
		const byLocationAndRoom = (() => {
			if (viaLocationID !== null) {
				return allItems.filter((info) => info.location.id === viaLocationID);
			}

			if (roomsFilter.length === 0 && locationsFilter.length === 0) {
				return allItems;
			}

			return allItems.filter((info) =>
				roomsFilter.includes(info.room.id) || locationsFilter.includes(info.location.id));
		})();

		if (searchTerm === '') {
			return byLocationAndRoom;
		}

		return byLocationAndRoom.filter(({ item, location, room }) =>
			item.name.toLowerCase().includes(searchTerm)
			|| location.name.toLowerCase().includes(searchTerm)
			|| room.name.toLowerCase().includes(searchTerm));
	})();

	const goBack = useSmartBack(fromLocations ? `/locations?room=${roomParam}` : '/');

	useEffect(() => {
		void loadAllItems();
	}, [loadAllItems]);

	const search = searchParams.toString();
	const query = search ? `?${search}` : '';

	// Carry the currently active filters into the modal so it opens pre-populated.
	const filterParams = new URLSearchParams();
	if (searchQuery !== '') {
		filterParams.set('search', searchQuery);
	}
	if (viaLocationID !== null) {
		filterParams.set('locations', String(viaLocationID));
	} else {
		if (roomsFilter.length > 0) {
			filterParams.set('rooms', roomsFilter.join(','));
		}
		if (locationsFilter.length > 0) {
			filterParams.set('locations', locationsFilter.join(','));
		}
	}
	const filterSearch = filterParams.toString();
	const filterQuery = filterSearch ? `?${filterSearch}` : '';

	return <>
		<div className="align-self-end">
			<IconLink onClick={goBack} src={BackLeftIcon} alt={t('home.back')} className='bare' />
		</div>
		<h1 className="main-title">
			<div className='main-title-actions-before'>
				<IconLink to={`/items/filter${filterQuery}`} src={SortFilterIcon} alt={t('items.sortFilter')} scale='70%' />
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
							<div>{location.name}{SEPARATOR}{room.name}</div>
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
