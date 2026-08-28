import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import Button from '../Button';
import Dropdown from './Dropdown';
import Modal from './Modal';
import type { LocationID } from '../../services';

function EditItem() {
	const { t } = useTranslation();
	const { items, locations, updateItem } = useHomesContext();
	const { id } = useParams<{ id: string }>();
	const item = items.find((info) => info.id === Number(id));
	const [name, setName] = useState(item?.name ?? '');
	const [locationID, setLocationID] = useState<LocationID | undefined>(item?.locationID);

	const shouldUpdate = name.trim() !== '' && locationID !== undefined &&
		(name.trim() !== item?.name || locationID !== item?.locationID);

	const close = useSmartBack(`/items?location=${item?.locationID}`);

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!item || !name.trim() || locationID === undefined) {
			return;
		}

		await updateItem(item.id, name.trim(), locationID);
		close();
	};

	return (
		<Modal onClose={close}>
			<form
				className='d-flex flex-column align-items-center gap-0'
				onSubmit={handleSubmit}
			>
				<h2>{t('items.edit')}</h2>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder={t('items.myNewItem')}
					autoFocus
				/>
				<div className='w-100 mt-2'>
					<Dropdown
						options={locations.map((info) => ({ value: info.location.id, label: info.location.name }))}
						value={locationID}
						onChange={setLocationID}
					/>
				</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button disabled={!shouldUpdate} className='confirm'>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</form>
		</Modal>
	);
}

export default EditItem;
