import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import useHomesContext from '../../hooks/useHomesContext';
import Dropdown, { type DropdownCreate } from './Dropdown';
import type { LocationID, RoomID } from '../../services';

/**
 * Where an item lives. A room or location is either one that already exists or a
 * name to be created on save. `newRoomName` implies `newLocationName`, since a
 * brand new room has nowhere to put the item yet.
 */
export type ItemPlacement = {
	roomID?: RoomID;
	locationID?: LocationID;
	newRoomName?: string;
	newLocationName?: string;
};

function ItemLocationFields({
	placement,
	onChange,
	allowCreate = false,
}: {
	placement: ItemPlacement;
	onChange: (placement: ItemPlacement) => void;
	// Offers "create new" entries in both dropdowns, for forms that can save them.
	allowCreate?: boolean;
}) {
	const { t } = useTranslation();
	const { rooms, locations, locationsRoomID, loadLocations } = useHomesContext();
	const { roomID, locationID, newRoomName, newLocationName } = placement;

	useEffect(() => {
		if (roomID !== undefined) {
			void loadLocations(roomID);
		}
	}, [roomID, loadLocations]);

	const locationsReady = roomID !== undefined && locationsRoomID === roomID;
	const creatingRoom = newRoomName !== undefined;

	const roomCreate: DropdownCreate | undefined = allowCreate
		? {
			label: t('items.createRoom'),
			placeholder: t('rooms.myNewRoom'),
			name: newRoomName,
			onNameChange: (name) => onChange({ ...placement, newRoomName: name }),
			// A new room starts empty, so its location has to be created alongside it.
			onStart: () => onChange({ newRoomName: '', newLocationName: '' }),
			onCancel: () => onChange({}),
			autoFocus: true,
		}
		: undefined;

	const locationCreate: DropdownCreate | undefined = allowCreate
		? {
			label: t('items.createLocation'),
			placeholder: t('locations.myNewLocation'),
			name: newLocationName,
			onNameChange: (name) => onChange({ ...placement, newLocationName: name }),
			onStart: () => onChange({ roomID, newLocationName: '' }),
			// Nothing to pick while the room itself is new, so stay in create mode.
			onCancel: creatingRoom ? undefined : () => onChange({ roomID }),
			// Both fields open at once for a new room; the room is named first.
			autoFocus: !creatingRoom,
		}
		: undefined;

	const handleRoomChange = (value: RoomID) => {
		// A room with no locations offers nothing to choose, so go straight to
		// naming one rather than showing an empty menu.
		const isEmpty = rooms.find((info) => info.room.id === value)?.locationCount === 0;
		onChange(allowCreate && isEmpty ? { roomID: value, newLocationName: '' } : { roomID: value });
	};

	return (
		<>
			<div className='w-100 mt-2'>
				<Dropdown
					options={rooms.map(({ room, locationCount }) => ({
						value: room.id,
						// Without on-the-fly creation, an empty room is a dead end.
						label: locationCount === 0 && !allowCreate
							? t('items.roomNoLocations', { name: room.name })
							: room.name,
						isDisabled: locationCount === 0 && !allowCreate,
					}))}
					value={roomID}
					onChange={handleRoomChange}
					placeholder={t('items.selectRoom')}
					create={roomCreate}
				/>
			</div>
			<div className='w-100 mt-2'>
				<Dropdown
					options={locationsReady
						? locations.map(({ location }) => ({ value: location.id, label: location.name }))
						: []}
					value={locationsReady ? locationID : undefined}
					onChange={(value) => onChange({ ...placement, locationID: value, newLocationName: undefined })}
					placeholder={t('items.selectLocation')}
					create={locationCreate}
				/>
			</div>
		</>
	);
}

export default ItemLocationFields;
