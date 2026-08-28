import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import type { ItemID } from '../../services';
import Button from '../Button';
import Modal from './Modal';

function DeleteItem() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const locationID = searchParams.get('location');
	const { items, deleteItem } = useHomesContext();
	const { id } = useParams<{ id: string }>();

	const item = items.find((info) => info.id === Number(id));

	const close = useSmartBack(`/items?location=${locationID}`);

	const handleConfirm = async () => {
		if (!id) {
			return;
		}

		await deleteItem(Number(id) as ItemID);
		close();
	};

	return (
		<Modal onClose={close}>
			<div className='d-flex flex-column align-items-center gap-0'>
				<h2>{t('areYouSure')}</h2>
				<div className='sheet'>
					⚠️ {t('items.deleteConfirm', item)}
				</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button className='confirm' onClick={handleConfirm}>{t('confirm')}</Button>
					<Button type='button' className='cancel' onClick={close}>{t('cancel')}</Button>
				</div>
			</div>
		</Modal>
	);
}

export default DeleteItem;
