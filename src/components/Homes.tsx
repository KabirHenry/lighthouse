import { useTranslation } from 'react-i18next';

function Homes() {
	const { t } = useTranslation();
	return <>
		{t('pages.homes')}
	</>;
}

export default Homes;