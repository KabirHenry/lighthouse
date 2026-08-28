import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import type { HomeID } from '../../services';
import Button from '../Button';
import Modal from './Modal';

function EditRoom() {
	const { t } = useTranslation();
	const { rooms, homes, updateRoom } = useHomesContext();
	const { id } = useParams<{ id: string }>();
	const room = rooms.find((info) => info.room.id === Number(id))?.room;
	const [name, setName] = useState(room?.name ?? '');
	const [homeID, setHomeID] = useState(room?.homeID);

	const shouldUpdate = name.trim() !== '' && homeID !== undefined &&
		(name.trim() !== room?.name || homeID !== room?.homeID);

	const close = useSmartBack('/rooms');

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!room || !name.trim() || homeID === undefined) {
			return;
		}

		await updateRoom(room.id, name.trim(), homeID);
		close();
	};

	return (
		<Modal onClose={close}>
			<form
				className='d-flex flex-column align-items-center gap-0'
				onSubmit={handleSubmit}
			>
				<h2>{t('rooms.edit')}</h2>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder={t('rooms.myNewRoom')}
					autoFocus
				/>
				<select
					value={homeID ?? ''}
					onChange={(event) => setHomeID(Number(event.target.value) as HomeID)}
				>
					{
						homes.map((home) => (
							<option key={home.id} value={home.id}>{home.name}</option>
						))
					}
				</select>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button disabled={!shouldUpdate} className='confirm'>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</form>
		</Modal>
	);
}

export default EditRoom;
