import { useTranslation } from 'react-i18next';

function NotFound() {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t('errors.notFound.title')}</h1>
			<p>{t('errors.notFound.message')}</p>
		</>
	);
}

export default NotFound;