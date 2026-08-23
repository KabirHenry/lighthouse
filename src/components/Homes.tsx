import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router';

import PlusIcon from '../assets/plus.svg';
import DustbinIcon from '../assets/dustbin.svg';
import BackRightIcon from '../assets/back-right.svg';
import PencilIcon from '../assets/pencil.svg';
import Button from './Button';
import useHomesContext from '../hooks/useHomesContext';
import type { HomeID } from '../services';
import { IconLink } from './IconLink';
import LightHousePixel from './LightHousePixel';

function Homes() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { home: activeHome, homes, setActiveHome } = useHomesContext();
	const isSingleHome = homes.length === 1;

	const selectHome = async (id: HomeID) => {
		if (id === activeHome?.id) {
			return;
		}

		await setActiveHome(id);
		navigate('/');
	};

	return <>
		<div className="align-self-end">
			<IconLink to="/" src={BackRightIcon} alt={t('home.back')} className='bare' />
		</div>
		<h1 className="main-title">
			<div className='main-title-actions-before'>
				<span className="lighthouse-anchor">
					<LightHousePixel style={{ top: '2px', left: -3 }} />
				</span>
			</div>
			<span className="main-title-text">{t('pages.homes')}</span>
			<div className="main-title-actions-after">
				<IconLink to="/homes/new" src={PlusIcon} alt={t('homes.add')} scale='65%' />
			</div>
		</h1>
		<div className="main-buttons main-list d-flex flex-column align-items-center">
			{
				homes.map(home => (
					<div className="main-list-item" key={home.id}>
						<div className="main-list-item-actions-before">
							<IconLink
								to={`/homes/${home.id}/delete`}
								src={DustbinIcon}
								scale='70%'
								alt={t('homes.delete')}
								disabled={isSingleHome}
								className='bare d-none d-md-block'
							/>
						</div>
						<Button
							style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
							onClick={() => selectHome(home.id)}
						>
							{home.id === activeHome?.id && <div>🏠</div>}
							<div>{home.name}</div>
						</Button>
						<div className="main-list-item-actions-after">
							<IconLink
								to={`/homes/${home.id}/delete`}
								src={DustbinIcon}
								scale='70%'
								alt={t('homes.delete')}
								disabled={isSingleHome}
								className='bare d-md-none'
							/>
							<IconLink
								to={`/homes/${home.id}`}
								src={PencilIcon}
								scale='80%'
								alt={t('homes.edit')}
								className='bare'
							/>
						</div>
					</div>
				))
			}
		</div>
		<Outlet/>
	</>;
}

export default Homes;