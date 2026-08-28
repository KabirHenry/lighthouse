import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import { parseIDList } from '../../utils/params';
import Button from '../Button';
import Modal from './Modal';
import MultiSelect from './MultiSelect';
import type { LocationID, RoomID } from '../../services';

function FilterItems() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { allItems, loadAllItems } = useHomesContext();

	useEffect(() => {
		void loadAllItems();
	}, [loadAllItems]);

	const [rooms, setRooms] = useState<RoomID[]>(() => parseIDList<RoomID>(searchParams.get('rooms')));
	const [locations, setLocations] = useState<LocationID[]>(
		() => parseIDList<LocationID>(searchParams.get('locations')),
	);

	const roomOptions = useMemo(() => {
		const names = new Map<RoomID, string>();
		for (const { room } of allItems) {
			names.set(room.id, room.name);
		}

		return Array.from(names, ([value, label]) => ({ value, label }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [allItems]);

	const locationOptions = useMemo(() => {
		const labels = new Map<LocationID, string>();
		for (const { location, room } of allItems) {
			labels.set(location.id, `${location.name} · ${room.name}`);
		}

		return Array.from(labels, ([value, label]) => ({ value, label }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [allItems]);

	const close = useSmartBack('/items');

	const handleApply = () => {
		const params = new URLSearchParams();
		if (rooms.length > 0) {
			params.set('rooms', rooms.join(','));
		}
		if (locations.length > 0) {
			params.set('locations', locations.join(','));
		}

		const search = params.toString();
		// Replace the modal's own history entry so that "back" from the filtered
		// list returns to the pre-filter page and the modal never reappears.
		navigate(search ? `/items?${search}` : '/items', { replace: true });
	};

	const handleClear = () => {
		setRooms([]);
		setLocations([]);
	};

	return (
		<Modal onClose={close}>
			<div className='d-flex flex-column align-items-center gap-0'>
				<h2>{t('items.sortFilter')}</h2>
				<div className='w-100 mt-2'>
					<MultiSelect
						options={roomOptions}
						value={rooms}
						onChange={setRooms}
						placeholder={t('items.selectRooms')}
					/>
				</div>
				<div className='w-100 mt-2'>
					<MultiSelect
						options={locationOptions}
						value={locations}
						onChange={setLocations}
						placeholder={t('items.selectLocations')}
					/>
				</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button type='button' className='confirm' onClick={handleApply}>{t('apply')}</Button>
					<Button type='button' onClick={handleClear}>{t('clear')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</div>
		</Modal>
	);
}

export default FilterItems;
