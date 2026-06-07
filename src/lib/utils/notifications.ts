import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { get } from 'svelte/store';
import { preferences } from '../stores/preferences';
import { location } from '../stores/location';
import { fetchWeather } from './weather';
import { getRecommendation } from './recommendation';

export async function requestNotificationPermission() {
	if (Capacitor.isNativePlatform()) {
		const status = await LocalNotifications.checkPermissions();
		if (status.display === 'prompt') {
			await LocalNotifications.requestPermissions();
		}
	} else if ('Notification' in window) {
		if (Notification.permission === 'default') {
			await Notification.requestPermission();
		}
	}
}

export async function scheduleDailyNotification() {
	const prefs = get(preferences);
	const loc = get(location);

	if (!prefs.notificationsEnabled || !loc.lat || !loc.lon) {
		if (Capacitor.isNativePlatform()) {
			const pending = await LocalNotifications.getPending();
			if (pending.notifications.length > 0) {
				await LocalNotifications.cancel(pending);
			}
		}
		return;
	}

	try {
		// Fetch weather to get the recommendation for the next few days
		const weather = await fetchWeather(loc.lat, loc.lon, prefs.unitSystem);
		const [hours, minutes] = prefs.notificationTime.split(':').map(Number);

		if (Capacitor.isNativePlatform()) {
			// Clear previous notifications first
			const pending = await LocalNotifications.getPending();
			if (pending.notifications.length > 0) {
				await LocalNotifications.cancel(pending);
			}

			const notifications = [];

			// Schedule for the next 5 days
			for (let i = 0; i < 5; i++) {
				const date = new Date();
				date.setDate(date.getDate() + i);
				date.setHours(hours, minutes, 0, 0);

				// If the time has already passed for today, skip to tomorrow
				if (date < new Date()) continue;

				// For each day, we use the forecast data we just fetched
				// The fetchWeather utility returns hourly data for several days
				// We need to slice the data for the specific day
				const dayStart = i * 24;
				const dayEnd = (i + 1) * 24;

				const dayWeather = {
					...weather,
					hourly: {
						time: weather.hourly.time.slice(dayStart, dayEnd),
						temp: weather.hourly.temp.slice(dayStart, dayEnd),
						feelsLike: weather.hourly.feelsLike.slice(dayStart, dayEnd),
						utci: weather.hourly.utci.slice(dayStart, dayEnd),
						precipProb: weather.hourly.precipProb.slice(dayStart, dayEnd),
					},
					current: {
						...weather.current,
						temp: weather.hourly.temp[dayStart + hours] || weather.current.temp,
						feelsLike: weather.hourly.feelsLike[dayStart + hours] || weather.current.feelsLike,
						utci: weather.hourly.utci[dayStart + hours] || weather.current.utci,
					}
				};

				const rec = getRecommendation(dayWeather, prefs);

				notifications.push({
					title: i === 0 ? 'Today\'s Outfit Recommendation' : `Outfit for ${date.toLocaleDateString(undefined, { weekday: 'long' })}`,
					body: rec.summary,
					id: i + 1,
					schedule: { at: date, allowWhileIdle: true }
				});
			}

			if (notifications.length > 0) {
				await LocalNotifications.schedule({ notifications });
			}
		} else {
			console.log('Web notifications scheduling simulated');
		}
	} catch (e) {
		console.error('Failed to schedule notifications:', e);
	}
}
