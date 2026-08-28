import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button';
import Modal from './Modal';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Don't nag: once dismissed, stay quiet for two weeks.
const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_COOLDOWN = 14 * 24 * 60 * 60 * 1000;

// iOS never fires `beforeinstallprompt`; wait a beat before showing the manual
// instructions so it doesn't slam the user the instant the page loads.
const IOS_HINT_DELAY = 3000;

function isStandalone() {
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

function isIos() {
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function recentlyDismissed() {
	try {
		const at = Number(localStorage.getItem(DISMISS_KEY));
		return Number.isFinite(at) && at > 0 && Date.now() - at < DISMISS_COOLDOWN;
	} catch {
		return false;
	}
}

function rememberDismissal() {
	try {
		localStorage.setItem(DISMISS_KEY, String(Date.now()));
	} catch {
		/* storage unavailable — nothing to remember */
	}
}

function InstallPrompt() {
	const { t } = useTranslation();
	const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (isStandalone() || recentlyDismissed()) {
			return;
		}

		const onBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			setDeferred(event as BeforeInstallPromptEvent);
			setVisible(true);
		};

		const onInstalled = () => {
			setDeferred(null);
			setVisible(false);
			try {
				localStorage.removeItem(DISMISS_KEY);
			} catch {
				/* ignore */
			}
		};

		window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
		window.addEventListener('appinstalled', onInstalled);

		let iosTimer: number | undefined;
		if (isIos()) {
			iosTimer = window.setTimeout(() => setVisible(true), IOS_HINT_DELAY);
		}

		return () => {
			window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
			window.removeEventListener('appinstalled', onInstalled);
			if (iosTimer) {
				window.clearTimeout(iosTimer);
			}
		};
	}, []);

	if (!visible) {
		return null;
	}

	const dismiss = () => {
		setVisible(false);
		rememberDismissal();
	};

	const install = async () => {
		if (!deferred) {
			return;
		}

		await deferred.prompt();
		const { outcome } = await deferred.userChoice;
		setDeferred(null);
		setVisible(false);
		if (outcome === 'dismissed') {
			rememberDismissal();
		}
	};

	const canPrompt = deferred !== null;

	return (
		<Modal onClose={dismiss}>
			<div className="d-flex flex-column align-items-center gap-0">
				<h2>{t('install.title')}</h2>
				<div className="sheet">
					{t('install.description')}
					{!canPrompt && isIos() ? ` ${t('install.iosInstructions')}` : ''}
				</div>
				<div
					className={`app-modal-footer d-flex flex-row w-100 ${
						canPrompt ? 'justify-content-between' : 'justify-content-center'
					}`}
				>
					{canPrompt && (
						<Button className="confirm" onClick={install}>
							{t('install.action')}
						</Button>
					)}
					<Button
						type="button"
						className={canPrompt ? 'cancel' : 'muted'}
						onClick={dismiss}
					>
						{canPrompt ? t('install.dismiss') : t('install.gotIt')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}

export default InstallPrompt;
