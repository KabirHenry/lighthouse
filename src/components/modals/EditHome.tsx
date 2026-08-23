import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import Button from '../Button';
import Modal from './Modal';

function EditHome() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { homes, updateHome } = useHomesContext();
	const { id } = useParams<{ id: string }>();
	const home = homes.find((home) => home.id === Number(id));
	const [name, setName] = useState(home?.name ?? '');

	const shouldUpdate = name.trim() !== '' && name.trim() !== home?.name;

	const close = () => navigate('/homes');

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!home || !name.trim()) {
			return;
		}

		await updateHome(home.id, name.trim());
		close();
	};

	return (
		<Modal onClose={close}>
			<form
				className='d-flex flex-column align-items-center gap-0'
				onSubmit={handleSubmit}
			>
				<h2>{t('homes.edit')}</h2>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder={t('homes.myNewHome')}
					autoFocus
				/>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button disabled={!shouldUpdate} className='confirm'>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</form>
		</Modal>
	);
}

export default EditHome;
