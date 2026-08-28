import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import Button from '../Button';
import Modal from './Modal';
import ItemLocationFields from './ItemLocationFields';
import type { LocationID, RoomID } from '../../services';

function AddItem() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const { addItem } = useHomesContext();

	const prefill = searchParams.get('via') === 'locations';
	const roomParam = searchParams.get('room');
	const locationParam = searchParams.get('location');

	const [name, setName] = useState('');
	const [roomID, setRoomID] = useState<RoomID | undefined>(
		prefill && roomParam ? (Number(roomParam) as RoomID) : undefined,
	);
	const [locationID, setLocationID] = useState<LocationID | undefined>(
		prefill && locationParam ? (Number(locationParam) as LocationID) : undefined,
	);

	const canSubmit = name.trim() !== '' && locationID !== undefined;

	const search = searchParams.toString();
	const close = useSmartBack(search ? `/items?${search}` : '/items');

	const handleRoomChange = (value: RoomID) => {
		setRoomID(value);
		setLocationID(undefined);
	};

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!name.trim() || locationID === undefined) {
			return;
		}

		await addItem(locationID, name.trim());
		close();
	};

	return (
		<Modal onClose={close}>
			<form
				className='d-flex flex-column align-items-center gap-0'
				onSubmit={handleSubmit}
			>
				<h2>{t('items.add')}</h2>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder={t('items.myNewItem')}
					autoFocus
				/>
				<ItemLocationFields
					roomID={roomID}
					locationID={locationID}
					onRoomChange={handleRoomChange}
					onLocationChange={setLocationID}
				/>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button disabled={!canSubmit} className='confirm'>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</form>
		</Modal>
	);
}

export default AddItem;
