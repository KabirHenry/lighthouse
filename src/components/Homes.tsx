import { useTranslation } from 'react-i18next';

import DustbinIcon from '../assets/dustbin.svg';
import BackRightIcon from '../assets/back-right.svg';
import PencilIcon from '../assets/pencil.svg';
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
		<h1>
			{t('pages.homes')}
		</h1>
		<div className="main-buttons home-list d-flex flex-column align-items-center">
			{
				homes.map(home => (
					<div className="main-list-item" key={home.id}>
						<div className="main-list-item-actions-before">
							<IconLink
								to={`/homes/${home.id}/delete`}
								src={DustbinIcon}
								scale='70%'
								alt={t('delete')}
								className='bare d-none d-md-block'
							/>
						</div>
						<Button>{home.name}</Button>
						<div className="main-list-item-actions-after">
							<IconLink
								to={`/homes/${home.id}/delete`}
								src={DustbinIcon}
								scale='70%'
								alt={t('delete')}
								className='bare d-md-none'
							/>
							<IconLink
								to={`/homes/${home.id}`}
								src={PencilIcon}
								scale='80%'
								alt={t('edit')}
								className='bare'
							/>
						</div>
					</div>
				))
			}
		</div>
	</>;
}

export default Homes;