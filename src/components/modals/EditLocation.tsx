import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import Button from '../Button';
import Dropdown from './Dropdown';
import Modal from './Modal';
import type { RoomID } from '../../services';

function EditLocation() {
	const { t } = useTranslation();
	const { locations, rooms, updateLocation } = useHomesContext();
	const { id } = useParams<{ id: string }>();
	const location = locations.find((info) => info.location.id === Number(id))?.location;
	const [name, setName] = useState(location?.name ?? '');
	const [roomID, setRoomID] = useState<RoomID | undefined>(location?.roomID);

	const shouldUpdate = name.trim() !== '' && roomID !== undefined &&
		(name.trim() !== location?.name || roomID !== location?.roomID);

	const close = useSmartBack(`/locations?room=${location?.roomID}`);

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!location || !name.trim() || roomID === undefined) {
			return;
		}

		await updateLocation(location.id, name.trim(), roomID);
		close();
	};

	return (
		<Modal onClose={close}>
			<form
				className='d-flex flex-column align-items-center gap-0'
				onSubmit={handleSubmit}
			>
				<h2>{t('locations.edit')}</h2>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder={t('locations.myNewLocation')}
					autoFocus
				/>
				<div className='w-100 mt-2'>
					<Dropdown
						options={rooms.map((info) => ({ value: info.room.id, label: info.room.name }))}
						value={roomID}
						onChange={setRoomID}
					/>
				</div>
				<div className='modal-hint'>{t('picture.editHint', { name: location?.name ?? '' })}</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button disabled={!shouldUpdate} className='confirm'>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</form>
		</Modal>
	);
}

export default EditLocation;
