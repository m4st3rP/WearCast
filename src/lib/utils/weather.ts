export interface WeatherData {
	current: {
		temp: number;
		feelsLike: number;
		weatherCode: number;
		windSpeed: number;
	};
	daily: {
		precipProbMax: number;
	};
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=precipitation_probability_max&timezone=auto`;
	
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
			precipProbMax: data.daily.precipitation_probability_max[0]
		}
	};
}
