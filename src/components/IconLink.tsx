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
	dataTour,
}: {
	to?: string;
	src: string;
	alt: string;
	disabled?: boolean;
	className?: string;
	style?: React.CSSProperties;
	onClick?: () => void,
	scale?: string;
	/** Tags this link as a guided-tour target. See `TourTarget` in `constants.ts`. */
	dataTour?: string;
}) {
	const image = <img
		style={{
			width: scale,
			height: scale,
		}}
		src={src}
		alt={alt}
	/>;

	const button = <Button
		variant="icon"
		className={className}
		style={style}
		disabled={disabled}
		onClick={onClick}
		dataTour={dataTour}
	>
		{image}
	</Button>;

	// With no destination this is a plain action (e.g. a back arrow), so render the button alone.
	// Wrapping it in a Link would leave an anchor to `''`, which resolves to the current path,
	// and React Router runs its own navigation after the handlerm, unless the handler prevents
	// the default. The click would land back on the page it started from, undoing whatever
	// `onClick` just did.
	if (!to || disabled) {
		return button;
	}

	return <Link to={to}>{button}</Link>;
}