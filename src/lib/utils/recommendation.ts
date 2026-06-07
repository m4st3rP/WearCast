import type { WeatherData } from './weather';
import type { Preferences } from '../stores/preferences';

export interface Recommendation {
	tops: string;
	bottoms: string;
	accessories: string;
	summary: string;
}

/**
 * Calculates the required CLO value based on UTCI.
 * Derived from the heat balance equation where 1 CLO is comfortable at 21°C.
 * Heuristic: Every 1°C below 21°C requires ~0.15 additional CLO.
 */
function calculateRequiredClo(utciCelsius: number): number {
	const comfortTemp = 21;
	if (utciCelsius >= comfortTemp) return 0.1; // Minimum for decency
	return 0.1 + (comfortTemp - utciCelsius) * 0.15;
}

export function getRecommendation(weather: WeatherData, prefs: Preferences): Recommendation {
	const hourly = weather.hourly;

	if (hourly.temp.length === 0) {
		return {
			tops: 'Unknown',
			bottoms: 'Unknown',
			accessories: 'Unknown',
			summary: 'Weather data unavailable.'
		};
	}

	const getClothingForUtci = (rawUtci: number, precipProb: number) => {
		const isMetric = prefs.unitSystem === 'metric';

		// 1. Convert UTCI to Celsius for consistent calculation
		const utciCelsius = isMetric ? rawUtci : (rawUtci - 32) * 5 / 9;

		// 2. Convert all preference thresholds to Celsius for comparison
		const toCelsius = (temp: number) => isMetric ? temp : (temp - 32) * 5 / 9;
		const shortsTempC = toCelsius(prefs.shortsTemp);
		const jacketTempC = toCelsius(prefs.jacketTemp);
		const sweaterTempC = toCelsius(prefs.sweaterTemp);
		const heavyJacketTempC = toCelsius(prefs.heavyJacketTemp);
		const accessoriesTempC = toCelsius(prefs.accessoriesTemp);

		// 3. Apply sensitivity offset (stored in Celsius)
		// Positive sensitivity means user feels colder, effectively lowering the perceived UTCI.
		const perceivedUtciC = utciCelsius - (prefs.sensitivity || 0);

		// 4. Calculate required insulation (CLO)
		const requiredClo = calculateRequiredClo(perceivedUtciC);

		let tops = 'T-shirt';
		let bottoms = 'Shorts';
		let accessories: string[] = [];

		const isRaining = precipProb >= prefs.umbrellaProb;
		const { cloValues } = prefs;

		// 5. Bottoms logic
		if (cloValues.longPants >= requiredClo * 0.4 || perceivedUtciC < shortsTempC) {
			bottoms = 'Long Pants';
		}

		// 6. Tops logic (Layering)
		const tshirtClo = cloValues.tshirt;
		const sweaterClo = cloValues.sweater;
		const lightJacketClo = cloValues.lightJacket;
		const heavyJacketClo = cloValues.heavyJacket;

		const totalRequiredTopsClo = requiredClo - (bottoms === 'Long Pants' ? cloValues.longPants : cloValues.shortPants);

		if (perceivedUtciC <= heavyJacketTempC || totalRequiredTopsClo > (sweaterClo + heavyJacketClo) * 0.8) {
			tops = 'Sweater & Heavy Jacket';
		} else if (perceivedUtciC <= jacketTempC || totalRequiredTopsClo > (sweaterClo + lightJacketClo) * 0.8) {
			// Jacket weather (but not heavy)
			if (isRaining) {
				tops = totalRequiredTopsClo > sweaterClo * 0.9 ? 'Sweater & Rain Jacket' : 'T-shirt & Rain Jacket';
			} else {
				tops = totalRequiredTopsClo > (tshirtClo + lightJacketClo) * 1.1 ? 'Sweater & Light Jacket' : 'T-shirt & Light Jacket';
			}
		} else if (perceivedUtciC <= sweaterTempC || totalRequiredTopsClo > sweaterClo * 0.9) {
			// Sweater weather (but not jacket)
			if (isRaining) {
				tops = 'T-shirt & Rain Jacket';
			} else {
				tops = 'Sweater / Hoodie';
			}
		} else {
			// T-shirt weather
			tops = isRaining ? 'T-shirt & Rain Jacket' : 'T-shirt';
		}

		// 7. Accessories logic
		if (perceivedUtciC <= accessoriesTempC) {
			if (cloValues.gloves > 0) accessories.push('Gloves 🧤');
			if (cloValues.hat > 0) accessories.push('Beanie/Hat 🧢');
		}

		if (isRaining) {
			accessories.push('Umbrella ☂️');
		}

		return { tops, bottoms, accessories: accessories.join(', ') || 'No accessories needed' };
	};

	const currentClothing = getClothingForUtci(weather.current.utci, weather.daily.precipProbMax || 0);

	// Analyze hourly ranges
	const hourlyUtcis = hourly.utci;
	const minUtci = Math.min(...hourlyUtcis);
	const maxUtci = Math.max(...hourlyUtcis);
	const maxPrecip = Math.max(...hourly.precipProb);

	const minClothing = getClothingForUtci(minUtci, maxPrecip);
	const maxClothing = getClothingForUtci(maxUtci, maxPrecip);

	let tops = currentClothing.tops;
	let bottoms = currentClothing.bottoms;
	let accessories = currentClothing.accessories;
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

	if (maxPrecip >= prefs.umbrellaProb) {
		summaryParts.push('High chance of rain, bring an umbrella!');
		if (!accessories.includes('Umbrella')) {
			accessories = accessories === 'No accessories needed' ? 'Umbrella ☂️' : accessories + ', Umbrella ☂️';
		}
	}

	return {
		tops,
		bottoms,
		accessories,
		summary: summaryParts.join(' ')
	};
}
