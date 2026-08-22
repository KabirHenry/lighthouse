import { Link } from 'react-router';

import Button from './Button';

export function IconLink({
	to,
	src,
	alt,
	className,
}: {
	to: string;
	src: string;
	alt: string;
	className?: string;
}) {
	return <Link to={to}>
		<Button variant="icon" className={className}>
			<img
				style={{
					width: '100%',
					height: '100%',
				}}
				src={src}
				alt={alt}
			/>
		</Button>
	</Link>;
}