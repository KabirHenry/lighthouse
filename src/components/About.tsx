import { useTranslation } from 'react-i18next';

function About() {
	const { t } = useTranslation();
	return <>
		{t('pages.about')}
	</>;
}

export default About;