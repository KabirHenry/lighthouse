import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import Button from '../Button';
import Modal from './Modal';

function AddHome() {
	const { t } = useTranslation();
	const { addHome } = useHomesContext();
	const [name, setName] = useState('');

	const canSubmit = name.trim() !== '';

	const close = useSmartBack('/homes');

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!name.trim()) {
			return;
		}

		await addHome(name.trim());
		close();
	};

	return (
		<Modal onClose={close}>
			<form
				className='d-flex flex-column align-items-center gap-0'
				onSubmit={handleSubmit}
			>
				<h2>{t('homes.add')}</h2>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder={t('homes.myNewHome')}
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

export default AddHome;
