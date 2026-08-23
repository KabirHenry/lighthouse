import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import type { LocationID } from '../../services';
import Button from '../Button';
import Modal from './Modal';

function DeleteLocation() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const roomID = searchParams.get('room');
	const { locations, deleteLocation } = useHomesContext();
	const { id } = useParams<{ id: string }>();

	const location = locations.find((info) => info.location.id === Number(id))?.location;

	const close = () => navigate(`/locations?room=${roomID}`);

	const handleConfirm = async () => {
		if (!id) {
			return;
		}

		await deleteLocation(Number(id) as LocationID);
		close();
	};

	return (
		<Modal onClose={close}>
			<div className='d-flex flex-column align-items-center gap-0'>
				<h2>{t('areYouSure')}</h2>
				<div className='sheet'>
					⚠️ {t('locations.deleteConfirm', location)}
				</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button className='confirm' onClick={handleConfirm}>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</div>
		</Modal>
	);
}

export default DeleteLocation;
