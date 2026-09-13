function Button({
	variant = 'text',
	type,
	disabled = false,
	onClick,
	className,
	style,
	snippet,
	dataTour,
	children
}: {
	variant?: 'icon' | 'text',
	type?: 'button' | 'submit' | 'reset',
	disabled?: boolean,
	onClick?: () => void,
	className?: string,
	style?: React.CSSProperties,
	snippet?: React.ReactNode,
	/** Tags this button as a guided-tour target. See `TourTarget` in `constants.ts`. */
	dataTour?: string,
	children: React.ReactNode
}) {
	const classes = ['btn', `btn-${variant}`, snippet ? 'btn-snippet-host' : '', className].filter(Boolean).join(' ');
	return <button
		type={type}
		className={classes}
		style={style}
		disabled={disabled}
		onClick={onClick}
		data-tour={dataTour}
	>
		{children}
		{snippet && <span className="btn-snippet">{snippet}</span>}
	</button>;
}

export default Button;