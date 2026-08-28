import { createRequire } from 'node:module';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const { version } = createRequire(import.meta.url)('./package.json') as { version: string };

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'prompt',
			includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
			manifest: {
				name: 'Lighthouse',
				short_name: 'Lighthouse',
				description: 'Keep your home items organized and find them when you need them.',
				lang: 'en',
				id: '/',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				orientation: 'portrait',
				background_color: '#000000',
				theme_color: '#000000',
				icons: [
					{ src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
					{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
					{ src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
					{
						src: 'maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
				navigateFallback: '/index.html',
				cleanupOutdatedCaches: true,
				// Ties the generated service worker to the app version so a bare
				// `npm version patch` + deploy is enough to trigger the update prompt,
				// even when no bundled asset hash changed.
				additionalManifestEntries: [{ url: '/', revision: version }],
			},
			devOptions: {
				enabled: false,
			},
		}),
	],
});
