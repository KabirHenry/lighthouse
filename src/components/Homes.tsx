import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import BackIcon from '../assets/back.svg';
import Button from './Button';
import useHomesContext from '../hooks/useHomesContext';

function Homes() {
	const { t } = useTranslation();
	const { homes } = useHomesContext();

	return <>
		<div className="align-self-end">
			<Link to="/">
				<Button variant="icon" className='bare'>
					<img
						style={{
							width: '100%',
							height: '100%',
						}}
						src={BackIcon}
						alt={t('home.back')}
					/>
				</Button>
			</Link>
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