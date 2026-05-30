import { useTranslation } from 'react-i18next';

function Rooms() {
	const { t } = useTranslation();
	return <>
		{t('pages.rooms')}
	</>;
}

export default Rooms;