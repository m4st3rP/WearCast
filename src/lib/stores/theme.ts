import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

const initial: Theme = browser
	? (window.localStorage.getItem('wearcast-theme') as Theme) || 'system'
	: 'system';

export const theme = writable<Theme>(initial);

if (browser) {
	theme.subscribe((value) => {
		window.localStorage.setItem('wearcast-theme', value);
		
		const isDark = 
			value === 'dark' || 
			(value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
			
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	// Listen for system preference changes
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		const currentTheme = window.localStorage.getItem('wearcast-theme');
		if (currentTheme === 'system' || !currentTheme) {
			if (e.matches) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	});
}