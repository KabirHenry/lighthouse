import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import Button from '../Button';
import Modal from './Modal';

function AddItem() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const locationID = searchParams.get('location');
	const { addItem } = useHomesContext();
	const [name, setName] = useState('');

	const canSubmit = name.trim() !== '';

	const close = useSmartBack(`/items?location=${locationID}`);

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!name.trim()) {
			return;
		}

		await addItem(name.trim());
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
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button disabled={!canSubmit} className='confirm'>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</form>
		</Modal>
	);
}

export default AddItem;
