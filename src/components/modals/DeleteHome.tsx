import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import type { HomeID } from '../../services';
import Button from '../Button';
import Modal from './Modal';

function DeleteHome() {
	const { t } = useTranslation();
	const { homes, deleteHome } = useHomesContext();
	const { id } = useParams<{ id: string }>();

	const home = homes.find((home) => home.id === Number(id));

	const close = useSmartBack('/homes');

	const handleConfirm = async () => {
		if (!id) {
			return;
		}

		await deleteHome(Number(id) as HomeID);
		close();
	};

	return (
		<Modal onClose={close}>
			<div className='d-flex flex-column align-items-center gap-0'>
				<h2>{t('areYouSure')}</h2>
				<div className='sheet'>
					⚠️ {t('homes.deleteConfirm', home)}
				</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button className='confirm' onClick={handleConfirm}>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</div>
		</Modal>
	);
}

export default DeleteHome;
