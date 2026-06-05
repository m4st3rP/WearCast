import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig(({ mode }) => {
	const isProduction = mode === 'production';
	return {
		plugins: [
			tailwindcss(),
			sveltekit(),
			SvelteKitPWA({
				srcDir: './src',
				mode: isProduction ? 'production' : 'development',
				strategies: 'generateSW',
				type: 'module',
				manifest: {
					short_name: 'WearCast',
					name: 'WearCast',
					start_url: process.env.BASE_PATH ? `${process.env.BASE_PATH}/` : '/',
					scope: process.env.BASE_PATH ? `${process.env.BASE_PATH}/` : '/',
					display: 'standalone',
					theme_color: '#ffffff',
					background_color: '#ffffff',
					icons: [
						{
							src: 'pwa-192x192.png',
							sizes: '192x192',
							type: 'image/png'
						},
						{
							src: 'pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png'
						}
					]
				},
				workbox: {
					globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
				}
			})
		]
	};
});