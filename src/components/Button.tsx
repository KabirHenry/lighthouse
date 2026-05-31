function Button({
	variant = 'text',
	children
}: {
	variant: 'icon' | 'text',
	children: React.ReactNode
}) {
	return <button className={`btn btn-${variant}`}>{children}</button>;
}

export default Button;