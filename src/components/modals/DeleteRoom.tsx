import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import type { RoomID } from '../../services';
import Button from '../Button';
import Modal from './Modal';

function DeleteRoom() {
	const { t } = useTranslation();
	const { rooms, deleteRoom } = useHomesContext();
	const { id } = useParams<{ id: string }>();

	const room = rooms.find((info) => info.room.id === Number(id))?.room;

	const close = useSmartBack('/rooms');

	const handleConfirm = async () => {
		if (!id) {
			return;
		}

		await deleteRoom(Number(id) as RoomID);
		close();
	};

	return (
		<Modal onClose={close}>
			<div className='d-flex flex-column align-items-center gap-0'>
				<h2>{t('areYouSure')}</h2>
				<div className='sheet'>
					⚠️ {t('rooms.deleteConfirm', room)}
				</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button className='confirm' onClick={handleConfirm}>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</div>
		</Modal>
	);
}

export default DeleteRoom;
