function Button({
	variant = 'text',
	className,
	children
}: {
	variant?: 'icon' | 'text',
	className?: string,
	children: React.ReactNode
}) {
	return <button className={['btn', `btn-${variant}`, className].filter(Boolean).join(' ')}>{children}</button>;
}

export default Button;