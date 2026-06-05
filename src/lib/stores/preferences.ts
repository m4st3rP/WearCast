import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Preferences {
	shortsTemp: number; // recommend shorts if temp is >=
	sweaterTemp: number; // recommend sweater if temp <=
	jacketTemp: number; // recommend jacket if temp <=
	heavyJacketTemp: number; // recommend heavy jacket if temp <=
	umbrellaProb: number; // recommend umbrella if precipitation prob >=
	notificationsEnabled: boolean;
	notificationTime: string; // HH:mm format
	unitSystem: 'metric' | 'imperial';
}

const defaultPreferences: Preferences = {
	shortsTemp: 22,
	sweaterTemp: 20,
	jacketTemp: 15,
	heavyJacketTemp: 5,
	umbrellaProb: 40,
	notificationsEnabled: true,
	notificationTime: '07:00',
	unitSystem: 'metric'
};

const initial = browser 
	? JSON.parse(window.localStorage.getItem('wearcast-prefs') || 'null') || defaultPreferences 
	: defaultPreferences;

export const preferences = writable<Preferences>(initial);

export function toggleUnitSystem() {
	preferences.update(prefs => {
		const newSystem = prefs.unitSystem === 'metric' ? 'imperial' : 'metric';

		const convert = (temp: number, toMetric: boolean) => {
			if (toMetric) {
				return Math.round((temp - 32) * 5 / 9);
			} else {
				return Math.round((temp * 9 / 5) + 32);
			}
		};

		const toMetric = newSystem === 'metric';

		return {
			...prefs,
			unitSystem: newSystem,
			shortsTemp: convert(prefs.shortsTemp, toMetric),
			sweaterTemp: convert(prefs.sweaterTemp, toMetric),
			jacketTemp: convert(prefs.jacketTemp, toMetric),
			heavyJacketTemp: convert(prefs.heavyJacketTemp, toMetric)
		};
	});
}

if (browser) {
	preferences.subscribe((value) => {
		window.localStorage.setItem('wearcast-prefs', JSON.stringify(value));
	});
}
