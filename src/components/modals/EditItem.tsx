import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import Button from '../Button';
import Modal from './Modal';
import ItemLocationFields, { type ItemPlacement } from './ItemLocationFields';

function EditItem() {
	const { t } = useTranslation();
	const { allItems, updateItem } = useHomesContext();
	const { id } = useParams<{ id: string }>();
	const [searchParams] = useSearchParams();

	const entry = allItems.find((info) => info.item.id === Number(id));
	const item = entry?.item;

	const [name, setName] = useState(item?.name ?? '');
	const [placement, setPlacement] = useState<ItemPlacement>({
		roomID: entry?.room.id,
		locationID: item?.locationID,
	});

	const { locationID } = placement;
	const shouldUpdate = name.trim() !== '' && locationID !== undefined &&
		(name.trim() !== item?.name || locationID !== item?.locationID);

	const search = searchParams.toString();
	const close = useSmartBack(search ? `/items?${search}` : '/items');

	const handlePlacementChange = (next: ItemPlacement) => {
		// Changing room clears the location; Picking the item's own room again puts
		// its current location back rather than leaving the field empty.
		setPlacement(next.locationID === undefined && next.roomID === entry?.room.id
			? { ...next, locationID: item?.locationID }
			: next);
	};

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
				<ItemLocationFields
					placement={placement}
					onChange={handlePlacementChange}
				/>
				<div className='modal-hint'>{t('picture.editHint', { name: item?.name ?? '' })}</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button disabled={!shouldUpdate} className='confirm'>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</form>
		</Modal>
	);
}

export default EditItem;
