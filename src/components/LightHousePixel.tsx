function LightHousePixel({
	className,
	style
}: {
	className?: string;
	style?: React.CSSProperties;
}) {
	return <span
		className={['lighthouse-pixel', className].filter(Boolean).join(' ')}
		style={style}
	/>;
}

export default LightHousePixel;
