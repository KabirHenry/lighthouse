import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import useHomesContext from '../hooks/useHomesContext';
import type { PictureID } from '../services';
import Button from './Button';
import { IconLink } from './IconLink';

/**
 * The middle icon in a secondary-list row. Shows the entity's picture (scaled to
 * fit the icon slot) when one is set, otherwise the generic fallback icon. Either
 * way it links through to the picture modal.
 */
export function SecondaryListPicture({
	to,
	pictureID,
	fallbackSrc,
	alt,
}: {
	to: string;
	pictureID?: PictureID;
	fallbackSrc: string;
	alt: string;
}) {
	const { getPicture } = useHomesContext();
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (pictureID === undefined) {
			return;
		}

		let cancelled = false;
		let objectUrl: string | null = null;

		void getPicture(pictureID).then((picture) => {
			if (cancelled || !picture) {
				return;
			}

			objectUrl = URL.createObjectURL(picture.data);
			setUrl(objectUrl);
		});

		return () => {
			cancelled = true;
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
			setUrl(null);
		};
	}, [pictureID, getPicture]);

	if (pictureID === undefined || !url) {
		return <IconLink to={to} src={fallbackSrc} alt={alt} className='bare secondary-list-icon' />;
	}

	return (
		<Link to={to}>
			<Button variant='icon' className='bare secondary-list-icon secondary-list-icon-picture'>
				<img src={url} alt={alt} />
			</Button>
		</Link>
	);
}
