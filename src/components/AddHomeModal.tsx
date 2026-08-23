import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import useHomesContext from '../hooks/useHomesContext';
import Button from './Button';
import Modal from './Modal';

function AddHomeModal() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { addHome } = useHomesContext();
	const [name, setName] = useState('');

	const close = () => navigate('/homes');

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!name.trim()) {
			return;
		}

		await addHome(name.trim());
		close();
	};

	return (
		<Modal onClose={close}>
			<form onSubmit={handleSubmit}>
				<h2>{t('homes.add')}</h2>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder={t('homes.namePlaceholder')}
					autoFocus
				/>
				<Button>{t('homes.add')}</Button>
			</form>
		</Modal>
	);
}

export default AddHomeModal;
