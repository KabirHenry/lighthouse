import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import useRoomsContext from '../../hooks/useRoomsContext';
import Button from '../Button';
import Modal from './Modal';

function AddRoom() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { addRoom } = useRoomsContext();
	const [name, setName] = useState('');

	const canSubmit = name.trim() !== '';

	const close = () => navigate('/rooms');

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!name.trim()) {
			return;
		}

		await addRoom(name.trim());
		close();
	};

	return (
		<Modal onClose={close}>
			<form
				className='d-flex flex-column align-items-center gap-0'
				onSubmit={handleSubmit}
			>
				<h2>{t('rooms.add')}</h2>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder={t('rooms.myNewRoom')}
					autoFocus
				/>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button disabled={!canSubmit} className='confirm'>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</form>
		</Modal>
	);
}

export default AddRoom;
