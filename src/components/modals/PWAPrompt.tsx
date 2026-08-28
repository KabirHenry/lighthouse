import { useTranslation } from 'react-i18next';

import usePWAContext from '../../hooks/usePWAContext';
import Button from '../Button';
import Modal from './Modal';

function PWAPrompt() {
	const { t } = useTranslation();
	const { needRefresh, dismissRefresh, updateServiceWorker } = usePWAContext();

	if (!needRefresh) {
		return null;
	}

	return (
		<Modal onClose={dismissRefresh}>
			<div className="d-flex flex-column align-items-center gap-0">
				<h2>{t('pwa.updateTitle')}</h2>
				<div className="sheet">{t('pwa.updateDescription')}</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button className="confirm" onClick={() => updateServiceWorker(true)}>
						{t('pwa.reload')}
					</Button>
					<Button type="button" className="cancel" onClick={dismissRefresh}>
						{t('pwa.dismiss')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}

export default PWAPrompt;
