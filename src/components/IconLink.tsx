import { Link } from 'react-router';

import Button from './Button';

export function IconLink({
	to,
	src,
	alt,
	className,
	style,
	onClick,
	scale = '100%',
}: {
	to: string;
	src: string;
	alt: string;
	className?: string;
	style?: React.CSSProperties;
	onClick?: () => void,
	scale?: string;
}) {
	const image = <img
		style={{
			width: scale,
			height: scale,
		}}
		src={src}
		alt={alt}
	/>;

	if (onClick) {
		return <Button
			variant="icon"
			className={className}
			style={style}
			onClick={onClick}
		>
			{image}
		</Button>;
	}

	return <Link to={to}>
		<Button variant="icon" className={className} style={style}>
			{image}
		</Button>
	</Link>;
}