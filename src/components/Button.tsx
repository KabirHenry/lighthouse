function Button({
	variant = 'text',
	disabled = false,
	onClick,
	className,
	style,
	children
}: {
	variant?: 'icon' | 'text',
	disabled?: boolean,
	onClick?: () => void,
	className?: string,
	style?: React.CSSProperties,
	children: React.ReactNode
}) {
	const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
	return <button
		className={classes}
		style={style}
		disabled={disabled}
		onClick={onClick}
	>{children}</button>;
}

export default Button;