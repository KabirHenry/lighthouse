import { Link } from 'react-router';

import Button from './Button';

export function IconLink({
	to = '',
	src,
	alt,
	disabled = false,
	className,
	style,
	onClick,
	scale = '100%',
}: {
	to?: string;
	src: string;
	alt: string;
	disabled?: boolean;
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

	return <Link to={!disabled ? to : '' } onClick={onClick}>
		<Button
			variant="icon"
			className={className}
			style={style}
			disabled={disabled}
		>
			{image}
		</Button>
	</Link>;
}