import {
	defineConfig,
	minimal2023Preset,
} from '@vite-pwa/assets-generator/config';

const preset = minimal2023Preset;

// The source favicon has a transparent background; the app itself is pure
// black, so bake that in rather than letting launchers pick a colour.
const background = '#000000';

for (const type of ['transparent', 'maskable', 'apple'] as const) {
	preset[type].resizeOptions = {
		...preset[type].resizeOptions,
		background,
		fit: 'contain',
	};
}
preset.maskable.padding = 0.3;
preset.apple.padding = 0.3;

export default defineConfig({
	headLinkOptions: {
		preset: '2023',
	},
	preset,
	images: ['public/favicon.svg'],
});
