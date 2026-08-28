import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BackRightIcon from '../assets/back-right.svg';
import { IconLink } from './IconLink';
import { titleWithBeacon } from './titleWithBeacon';
import useSmartBack from '../hooks/useSmartBack';
import usePWAContext from '../hooks/usePWAContext';
import { isStandalone } from '../utils/pwa';
import Button from './Button';
import './About.css';

function About() {
	const { t } = useTranslation();
	const goBack = useSmartBack('/');
	const { needRefresh, checkForUpdate, updateServiceWorker } = usePWAContext();
	const [status, setStatus] = useState<'idle' | 'checking' | 'current' | 'error'>('idle');

	// In a browser tab a plain refresh already gets the latest build; the manual
	// check only earns its place in the installed app.
	const showUpdateCheck = isStandalone();

	const handleCheck = async () => {
		if (needRefresh) {
			await updateServiceWorker(true);
			return;
		}

		setStatus('checking');
		const result = await checkForUpdate();
		// 'updated' surfaces on its own through the reload prompt.
		setStatus(result === 'current' ? 'current' : result === 'updated' ? 'idle' : 'error');
	};

	const label = needRefresh
		? t('pwa.reload')
		: status === 'checking'
			? t('about.checking')
			: t('about.checkUpdates');

	return <>
		<div className="align-self-end">
			<IconLink onClick={goBack} src={BackRightIcon} alt={t('home.back')} className='bare' />
		</div>
		<h1>{titleWithBeacon(t('home.title'))}</h1>
		<div className="about d-flex flex-column align-items-center">
			<p className="about-description">{t('about.description')}</p>
			<img className="about-logo" src="/favicon.svg" alt={t('home.title')} />
			<p className="about-copyright">{t('about.copyright')}</p>
			{showUpdateCheck && (
				<div className="about-update d-flex flex-column align-items-center">
					<Button onClick={handleCheck} disabled={status === 'checking'}>{label}</Button>
					{status === 'current' && (
						<p className="about-update-status">{t('about.upToDate')}</p>
					)}
					{status === 'error' && (
						<p className="about-update-status">{t('about.updateError')}</p>
					)}
				</div>
			)}
		</div>
	</>;
}

export default About;
