import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Preferences {
	shortsTemp: number; // UTCI threshold for shorts
	sweaterTemp: number; // UTCI threshold for sweater/hoodie
	jacketTemp: number; // UTCI threshold for light jacket
	heavyJacketTemp: number; // UTCI threshold for heavy jacket
	accessoriesTemp: number; // UTCI threshold for gloves/hats
	umbrellaProb: number; // recommend umbrella if precipitation prob >=
	notificationsEnabled: boolean;
	notificationTime: string; // HH:mm format
	unitSystem: 'metric' | 'imperial';
	sensitivity: number; // -5 to +5 offset to UTCI
	cloValues: {
		tshirt: number;
		sweater: number;
		lightJacket: number;
		heavyJacket: number;
		longPants: number;
		shortPants: number;
		gloves: number;
		hat: number;
	};
}

const defaultPreferences: Preferences = {
	shortsTemp: 22,
	sweaterTemp: 20,
	jacketTemp: 15,
	heavyJacketTemp: 5,
	accessoriesTemp: 0,
	umbrellaProb: 40,
	notificationsEnabled: true,
	notificationTime: '07:00',
	unitSystem: 'metric',
	sensitivity: 0,
	cloValues: {
		tshirt: 0.1,
		sweater: 0.3,
		lightJacket: 0.25,
		heavyJacket: 0.6,
		longPants: 0.25,
		shortPants: 0.05,
		gloves: 0.05,
		hat: 0.05
	}
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
			heavyJacketTemp: convert(prefs.heavyJacketTemp, toMetric),
			accessoriesTemp: convert(prefs.accessoriesTemp, toMetric)
		};
	});
}

if (browser) {
	preferences.subscribe((value) => {
		window.localStorage.setItem('wearcast-prefs', JSON.stringify(value));
	});
}
