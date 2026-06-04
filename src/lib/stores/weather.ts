import { writable, get } from 'svelte/store';
import { location } from './location';
import { fetchWeather, type WeatherData } from '../utils/weather';

interface WeatherState {
	data: WeatherData | null;
	loading: boolean;
	error: string | null;
}

export const weather = writable<WeatherState>({
	data: null,
	loading: false,
	error: null
});

export async function updateWeather() {
	const loc = get(location);
	if (loc.lat === null || loc.lon === null) return;

	weather.update((w) => ({ ...w, loading: true, error: null }));
	
	try {
		const data = await fetchWeather(loc.lat, loc.lon);
		weather.set({ data, loading: false, error: null });
	} catch (e: any) {
		weather.update((w) => ({ ...w, loading: false, error: e.message || 'Unknown error' }));
	}
}

// Auto-update weather when location changes
location.subscribe((loc) => {
	if (loc.lat !== null && loc.lon !== null) {
		updateWeather();
	}
});
