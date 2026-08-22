import { useTranslation } from 'react-i18next';

import BackRightIcon from '../assets/back-right.svg';
import Button from './Button';
import useHomesContext from '../hooks/useHomesContext';
import { IconLink } from './IconLink';

function Homes() {
	const { t } = useTranslation();
	const { homes } = useHomesContext();

	return <>
		<div className="align-self-end">
			<IconLink to="/" src={BackRightIcon} alt={t('home.back')} className='bare' />
		</div>
		<h1>{t('pages.homes')}</h1>
		<div className="main-buttons d-flex flex-column align-items-center">
			{
				homes.map(home => (
					<Button key={home.id}>{home.name}</Button>
				))
			}
		</div>
	</>;
}

export default Homes;