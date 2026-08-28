import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import useHomesContext from '../../hooks/useHomesContext';
import Dropdown from './Dropdown';
import type { LocationID, RoomID } from '../../services';

function ItemLocationFields({
	roomID,
	locationID,
	onRoomChange,
	onLocationChange,
}: {
	roomID: RoomID | undefined;
	locationID: LocationID | undefined;
	onRoomChange: (value: RoomID) => void;
	onLocationChange: (value: LocationID) => void;
}) {
	const { t } = useTranslation();
	const { rooms, locations, locationsRoomID, loadLocations } = useHomesContext();

	useEffect(() => {
		if (roomID !== undefined) {
			void loadLocations(roomID);
		}
	}, [roomID, loadLocations]);

	const locationsReady = roomID !== undefined && locationsRoomID === roomID;

	return (
		<>
			<div className='w-100 mt-2'>
				<Dropdown
					options={rooms.map(({ room, locationCount }) => ({
						value: room.id,
						label: locationCount === 0 ? t('items.roomNoLocations', { name: room.name }) : room.name,
						isDisabled: locationCount === 0,
					}))}
					value={roomID}
					onChange={onRoomChange}
					placeholder={t('items.selectRoom')}
				/>
			</div>
			<div className='w-100 mt-2'>
				<Dropdown
					options={locationsReady
						? locations.map(({ location }) => ({ value: location.id, label: location.name }))
						: []}
					value={locationsReady ? locationID : undefined}
					onChange={onLocationChange}
					placeholder={t('items.selectLocation')}
				/>
			</div>
		</>
	);
}

export default ItemLocationFields;
