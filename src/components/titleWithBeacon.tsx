import LightHousePixel from './LightHousePixel';

export function titleWithBeacon(title: string) {
	const index = title.toLowerCase().indexOf('i');
	if (index === -1) {
		const halfIndex = Math.floor(title.length / 2);
		return <>
			{title.slice(0, halfIndex)}
			<span className="lighthouse-anchor">
				{title[halfIndex]}
				<LightHousePixel />
			</span>
			{title.slice(halfIndex + 1)}
		</>;
	}

	return <>
		{title.slice(0, index)}
		<span className="lighthouse-anchor">
			{title[index]}
			<LightHousePixel style={{ top: '4px' }} />
		</span>
		{title.slice(index + 1)}
	</>;
}
