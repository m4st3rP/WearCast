import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface LocationState {
	lat: number | null;
	lon: number | null;
	name: string | null;
	error: string | null;
	loading: boolean;
	searchResults: Array<{ name: string; lat: number; lon: number; country: string }> | null;
}

const defaultLocation: LocationState = {
	lat: null,
	lon: null,
	name: null,
	error: null,
	loading: false,
	searchResults: null
};

const initial = browser
	? JSON.parse(window.localStorage.getItem('wearcast-location') || 'null') || defaultLocation
	: defaultLocation;

export const location = writable<LocationState>(initial);

if (browser) {
	location.subscribe((value) => {
		if (value.lat !== null && value.lon !== null) {
			window.localStorage.setItem('wearcast-location', JSON.stringify({ lat: value.lat, lon: value.lon, name: value.name, error: null, loading: false, searchResults: null }));
		}
	});
}

export function requestLocation() {
	if (!browser || !('geolocation' in navigator)) {
		location.update((l) => ({ ...l, error: 'Geolocation not supported' }));
		return;
	}

	location.update((l) => ({ ...l, loading: true, error: null }));

	navigator.geolocation.getCurrentPosition(
		(position) => {
			location.set({
				lat: position.coords.latitude,
				lon: position.coords.longitude,
				name: 'Current Location',
				error: null,
				loading: false,
				searchResults: null
			});
		},
		(error) => {
			location.update((l) => ({ ...l, loading: false, error: error.message }));
		}
	);
}

export async function searchLocation(query: string) {
	if (!query) return;
	location.update((l) => ({ ...l, loading: true, error: null }));
	try {
		const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
		const data = await res.json();
		if (data.results && data.results.length > 0) {
			const results = data.results.map((r: any) => ({
				name: r.name,
				lat: r.latitude,
				lon: r.longitude,
				country: r.country || ''
			}));
			location.update((l) => ({ ...l, searchResults: results, loading: false }));
		} else {
			location.update((l) => ({ ...l, error: 'No locations found', loading: false, searchResults: [] }));
		}
	} catch (e: any) {
		location.update((l) => ({ ...l, error: 'Search failed', loading: false }));
	}
}

export function setLocationManual(name: string, lat: number, lon: number) {
	location.set({
		lat,
		lon,
		name,
		error: null,
		loading: false,
		searchResults: null
	});
}
