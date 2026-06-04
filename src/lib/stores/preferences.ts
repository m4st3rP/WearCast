import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Preferences {
	shortsTemp: number; // recommend shorts if temp is >=
	sweaterTemp: number; // recommend sweater if temp <=
	jacketTemp: number; // recommend jacket if temp <=
	heavyJacketTemp: number; // recommend heavy jacket if temp <=
	umbrellaProb: number; // recommend umbrella if precipitation prob >=
}

const defaultPreferences: Preferences = {
	shortsTemp: 22,
	sweaterTemp: 20,
	jacketTemp: 15,
	heavyJacketTemp: 5,
	umbrellaProb: 40
};

const initial = browser 
	? JSON.parse(window.localStorage.getItem('wearcast-prefs') || 'null') || defaultPreferences 
	: defaultPreferences;

export const preferences = writable<Preferences>(initial);

if (browser) {
	preferences.subscribe((value) => {
		window.localStorage.setItem('wearcast-prefs', JSON.stringify(value));
	});
}
