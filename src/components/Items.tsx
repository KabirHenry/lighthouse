import { useTranslation } from 'react-i18next';

function Items() {
	const { t } = useTranslation();
	return <>
		{t('pages.items')}
	</>;
}

export default Items;