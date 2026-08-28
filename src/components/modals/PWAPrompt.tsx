import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';

import Button from '../Button';
import Modal from './Modal';

// Re-check for a new service worker roughly every hour while the app stays open.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

function PWAPrompt() {
	const { t } = useTranslation();
	const {
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisteredSW(_swUrl, registration) {
			if (!registration) return;
			setInterval(() => {
				registration.update();
			}, UPDATE_CHECK_INTERVAL);
		},
	});

	if (!needRefresh) return null;

	const dismiss = () => setNeedRefresh(false);

	return (
		<Modal onClose={dismiss}>
			<div className="d-flex flex-column align-items-center gap-0">
				<h2>{t('pwa.updateTitle')}</h2>
				<div className="sheet">{t('pwa.updateDescription')}</div>
				<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
					<Button className="confirm" onClick={() => updateServiceWorker(true)}>
						{t('pwa.reload')}
					</Button>
					<Button type="button" className="cancel" onClick={dismiss}>
						{t('pwa.dismiss')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}

export default PWAPrompt;
