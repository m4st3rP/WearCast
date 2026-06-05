export interface WeatherData {
	current: {
		temp: number;
		feelsLike: number;
		weatherCode: number;
		windSpeed: number;
	};
	daily: {
		precipProbMax: number;
		tempMax: number;
		tempMin: number;
		feelsLikeMax: number;
		feelsLikeMin: number;
	};
	hourly: {
		time: string[];
		temp: number[];
		feelsLike: number[];
		precipProb: number[];
	};
}

export async function fetchWeather(lat: number, lon: number, unitSystem: 'metric' | 'imperial' = 'metric'): Promise<WeatherData> {
	const units = unitSystem === 'imperial'
		? '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch'
		: '';

	const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max&hourly=temperature_2m,apparent_temperature,precipitation_probability&timezone=auto${units}`;
	
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error('Failed to fetch weather');
	}

	const data = await res.json();
	
	return {
		current: {
			temp: data.current.temperature_2m,
			feelsLike: data.current.apparent_temperature,
			weatherCode: data.current.weather_code,
			windSpeed: data.current.wind_speed_10m
		},
		daily: {
			precipProbMax: data.daily.precipitation_probability_max[0],
			tempMax: data.daily.temperature_2m_max[0],
			tempMin: data.daily.temperature_2m_min[0],
			feelsLikeMax: data.daily.apparent_temperature_max[0],
			feelsLikeMin: data.daily.apparent_temperature_min[0]
		},
		hourly: {
			time: data.hourly.time,
			temp: data.hourly.temperature_2m,
			feelsLike: data.hourly.apparent_temperature,
			precipProb: data.hourly.precipitation_probability
		}
	};
}
