import { Link } from 'react-router';
import { Container, Dropdown } from 'react-bootstrap';
import { BarLoader } from 'react-spinners';
import { useTranslation } from 'react-i18next';

import useHomesContext from '../hooks/useHomesContext';

function HomeSelector() {
	const { t } = useTranslation();
	const { isLoaded, home, homes } = useHomesContext();

	if (!isLoaded) {
		return <Container className="py-4 px-3 mx-auto">
			<BarLoader width={'100%'} />
		</Container>;
	}

	return <Container className="py-4 px-3 mx-auto">
		<Dropdown className="mb-4">
			<Dropdown.Toggle id="home-dropdown">
				🏠
			</Dropdown.Toggle>
			<Dropdown.Menu>
				{homes.map((h) => (
					<Dropdown.ItemText key={h.id}>
						{home?.id === h.id && <span className="user-select-none">✅ </span>}
						{h.name}
					</Dropdown.ItemText>
				))}
				<Dropdown.Divider />
				<Dropdown.Item as={Link} to="/add-home">{t('homeSelector.addHome')}</Dropdown.Item>
			</Dropdown.Menu>
		</Dropdown>
	</Container>;
}

export default HomeSelector;