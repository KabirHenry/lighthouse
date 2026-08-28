import { useTranslation } from 'react-i18next';

import BackRightIcon from '../assets/back-right.svg';
import { IconLink } from './IconLink';
import { titleWithBeacon } from './titleWithBeacon';
import useSmartBack from '../hooks/useSmartBack';
import './About.css';

function About() {
	const { t } = useTranslation();
	const goBack = useSmartBack('/');

	return <>
		<div className="align-self-end">
			<IconLink onClick={goBack} src={BackRightIcon} alt={t('home.back')} className='bare' />
		</div>
		<h1>{titleWithBeacon(t('home.title'))}</h1>
		<div className="about d-flex flex-column align-items-center">
			<p className="about-description">{t('about.description')}</p>
			<img className="about-logo" src="/favicon.svg" alt={t('home.title')} />
			<p className="about-copyright">{t('about.copyright')}</p>
		</div>
	</>;
}

export default About;
