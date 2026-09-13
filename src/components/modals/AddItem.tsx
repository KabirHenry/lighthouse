import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import Button from '../Button';
import Modal from './Modal';
import ItemLocationFields, { type ItemPlacement } from './ItemLocationFields';
import type { LocationID, RoomID } from '../../services';

enum AddKind {
	LOCATION = 'location',
	NEW_LOCATION = 'newLocation',
	NEW_ROOM = 'newRoom',
}

// The add path a finished placement maps onto.
type AddTarget =
	| { kind: AddKind.LOCATION; locationID: LocationID }
	| { kind: AddKind.NEW_LOCATION; roomID: RoomID; locationName: string }
	| { kind: AddKind.NEW_ROOM; roomName: string; locationName: string };

// Resolves what the form would save.
function resolveTarget({ roomID, locationID, newRoomName, newLocationName }: ItemPlacement): AddTarget | null {
	const locationName = newLocationName?.trim();

	if (newRoomName !== undefined) {
		const roomName = newRoomName.trim();
		return roomName && locationName ? { kind: AddKind.NEW_ROOM, roomName, locationName } : null;
	}

	if (newLocationName !== undefined) {
		return roomID !== undefined && locationName ? { kind: AddKind.NEW_LOCATION, roomID, locationName } : null;
	}

	return locationID !== undefined ? { kind: AddKind.LOCATION, locationID } : null;
}

function AddItem() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const { addItem, addItemAndLocation, addItemAndLocationAndRoom } = useHomesContext();

	const prefill = searchParams.get('via') === 'locations';
	const roomParam = searchParams.get('room');
	const locationParam = searchParams.get('location');

	const [name, setName] = useState('');
	const [placement, setPlacement] = useState<ItemPlacement>({
		roomID: prefill && roomParam ? (Number(roomParam) as RoomID) : undefined,
		locationID: prefill && locationParam ? (Number(locationParam) as LocationID) : undefined,
	});

	const target = resolveTarget(placement);
	const canSubmit = name.trim() !== '' && target !== null;

	const search = searchParams.toString();
	const close = useSmartBack(search ? `/items?${search}` : '/items');

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		const itemName = name.trim();
		if (!itemName || !target) {
			return;
		}

		switch (target.kind) {
		case AddKind.NEW_ROOM:
			await addItemAndLocationAndRoom(target.roomName, target.locationName, itemName);
			break;
		case AddKind.NEW_LOCATION:
			await addItemAndLocation(target.roomID, target.locationName, itemName);
			break;
		case AddKind.LOCATION:
			await addItem(target.locationID, itemName);
			break;
		}

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
					placement={placement}
					onChange={setPlacement}
					allowCreate
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
