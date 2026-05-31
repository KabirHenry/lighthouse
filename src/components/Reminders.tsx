import { useTranslation } from 'react-i18next';

function Reminders() {
	const { t } = useTranslation();
	return <>
		{t('pages.reminders')}
	</>;
}

export default Reminders;