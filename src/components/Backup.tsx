import { useTranslation } from 'react-i18next';

function Backup() {
	const { t } = useTranslation();
	return <>
		{t('pages.backup')}
	</>;
}

export default Backup;