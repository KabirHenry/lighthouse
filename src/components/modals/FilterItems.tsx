import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import { parseIDList } from '../../utils/params';
import SearchIcon from '../../assets/search.svg';
import Button from '../Button';
import Modal from './Modal';
import MultiSelect from './MultiSelect';
import type { DropdownOption } from './dropdownStyles';
import type { LocationID, RoomID } from '../../services';

/** Enabled options first (A→Z), then the disabled "(no items)" ones (A→Z). */
function sortOptions<T>(options: DropdownOption<T>[]): DropdownOption<T>[] {
	return [...options].sort((a, b) => {
		if (Boolean(a.isDisabled) !== Boolean(b.isDisabled)) {
			return a.isDisabled ? 1 : -1;
		}
		return a.label.localeCompare(b.label);
	});
}

function FilterItems() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { rooms, allLocations, loadAllLocations } = useHomesContext();

	useEffect(() => {
		void loadAllLocations();
	}, [loadAllLocations]);

	const [searchText, setSearchText] = useState(() => searchParams.get('search') ?? '');
	const [selectedRooms, setSelectedRooms] = useState<RoomID[]>(
		() => parseIDList<RoomID>(searchParams.get('rooms')),
	);
	const [selectedLocations, setSelectedLocations] = useState<LocationID[]>(
		() => parseIDList<LocationID>(searchParams.get('locations')),
	);

	const roomOptions = useMemo(() => sortOptions(
		rooms.map(({ room, itemCount }) => ({
			value: room.id,
			label: itemCount === 0 ? t('items.nameNoItems', { name: room.name }) : room.name,
			isDisabled: itemCount === 0,
		})),
	), [rooms, t]);

	const locationOptions = useMemo(() => sortOptions(
		allLocations.map(({ location, room, itemCount }) => {
			const label = `${location.name} · ${room.name}`;
			return {
				value: location.id,
				label: itemCount === 0 ? t('items.nameNoItems', { name: label }) : label,
				isDisabled: itemCount === 0,
			};
		}),
	), [allLocations, t]);

	const close = useSmartBack('/items');

	const handleApply = () => {
		const params = new URLSearchParams();
		const trimmedSearch = searchText.trim();
		if (trimmedSearch !== '') {
			params.set('search', trimmedSearch);
		}
		if (selectedRooms.length > 0) {
			params.set('rooms', selectedRooms.join(','));
		}
		if (selectedLocations.length > 0) {
			params.set('locations', selectedLocations.join(','));
		}

		const query = params.toString();
		// Replace the modal's own history entry so that "back" from the filtered
		// list returns to the pre-filter page and the modal never reappears.
		navigate(query ? `/items?${query}` : '/items', { replace: true });
	};

	const handleClear = () => {
		setSearchText('');
		setSelectedRooms([]);
		setSelectedLocations([]);
	};

	return (
		<Modal onClose={close}>
			<div className='d-flex flex-column align-items-center gap-0'>
				<h2>{t('items.sortFilter')}</h2>
				<div className='app-modal-search'>
					<img className='app-modal-search-icon' src={SearchIcon} alt='' />
					<input
						type="text"
						value={searchText}
						onChange={(event) => setSearchText(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								event.preventDefault();
								handleApply();
							}
						}}
						placeholder={t('items.searchPlaceholder')}
						autoFocus
					/>
				</div>
				<div className='w-100 mt-2'>
					<MultiSelect
						options={roomOptions}
						value={selectedRooms}
						onChange={setSelectedRooms}
						placeholder={t('items.selectRooms')}
					/>
				</div>
				<div className='w-100 mt-2'>
					<MultiSelect
						options={locationOptions}
						value={selectedLocations}
						onChange={setSelectedLocations}
						placeholder={t('items.selectLocations')}
					/>
				</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button type='button' className='confirm' onClick={handleApply}>{t('apply')}</Button>
					<Button type='button' className='muted' onClick={handleClear}>{t('clear')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</div>
		</Modal>
	);
}

export default FilterItems;
