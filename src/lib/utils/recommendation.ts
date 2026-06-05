import type { WeatherData } from './weather';
import type { Preferences } from '../stores/preferences';

export interface Recommendation {
	tops: string;
	bottoms: string;
	accessories: string;
	summary: string;
}

export function getRecommendation(weather: WeatherData, prefs: Preferences): Recommendation {
	// Look at the hourly forecast
	// If it's for today, we might want to start from "now"
	// But if it's for a future day (scheduled notification), we look at the whole day
	const hourly = weather.hourly;

	if (hourly.temp.length === 0) {
		return {
			tops: 'Unknown',
			bottoms: 'Unknown',
			accessories: 'Unknown',
			summary: 'Weather data unavailable.'
		};
	}

	const minFeelsLike = Math.min(...hourly.feelsLike);
	const maxFeelsLike = Math.max(...hourly.feelsLike);
	const maxPrecip = Math.max(...hourly.precipProb);

	const getClothing = (temp: number) => {
		let tops = 'T-Shirt';
		if (temp <= prefs.heavyJacketTemp) tops = 'Heavy Jacket & Sweater';
		else if (temp <= prefs.jacketTemp) tops = 'Jacket & Long Sleeve';
		else if (temp <= prefs.sweaterTemp) tops = 'Sweater / Hoodie';

		let bottoms = temp >= prefs.shortsTemp ? 'Shorts' : 'Long Pants';
		return { tops, bottoms };
	};

	const currentClothing = getClothing(weather.current.feelsLike);
	const minClothing = getClothing(minFeelsLike);
	const maxClothing = getClothing(maxFeelsLike);

	let tops = currentClothing.tops;
	let bottoms = currentClothing.bottoms;
	let summaryParts = [];

	if (minClothing.tops !== maxClothing.tops) {
		tops = `${minClothing.tops} (Morning) → ${maxClothing.tops} (Afternoon)`;
		summaryParts.push(`Tops will change from ${minClothing.tops} to ${maxClothing.tops}.`);
	} else {
		summaryParts.push(`Wear a ${tops}.`);
	}

	if (minClothing.bottoms !== maxClothing.bottoms) {
		bottoms = `${minClothing.bottoms} → ${maxClothing.bottoms}`;
		summaryParts.push(`You might want to switch from ${minClothing.bottoms} to ${maxClothing.bottoms} later.`);
	} else {
		summaryParts.push(`${bottoms} should be fine all day.`);
	}

	let accessories = maxPrecip >= prefs.umbrellaProb ? 'Bring an Umbrella ☂️' : 'No Umbrella needed';
	if (maxPrecip >= prefs.umbrellaProb) {
		summaryParts.push('High chance of rain, bring an umbrella!');
	}

	return {
		tops,
		bottoms,
		accessories,
		summary: summaryParts.join(' ')
	};
}
