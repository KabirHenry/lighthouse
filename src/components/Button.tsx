function Button({
	variant = 'text',
	disabled = false,
	onClick,
	className,
	children
}: {
	variant?: 'icon' | 'text',
	disabled?: boolean,
	onClick?: () => void,
	className?: string,
	children: React.ReactNode
}) {
	const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
	return <button
		className={classes}
		disabled={disabled}
		onClick={onClick}
	>{children}</button>;
}

export default Button;