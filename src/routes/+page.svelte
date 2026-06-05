<script lang="ts">
	import { location, requestLocation, searchLocation, setLocationManual } from '$lib/stores/location';
	import { weather } from '$lib/stores/weather';
	import { preferences } from '$lib/stores/preferences';
	import { getRecommendation } from '$lib/utils/recommendation';

	let searchQuery = $state('');

	// Derived recommendation logic based on preferences and current weather
	let recommendation = $derived(() => {
		if (!$weather.data) return null;
		
		// For the home page, we want to look at the forecast from NOW onwards
		const nowIdx = $weather.data.hourly.time.findIndex(t => new Date(t) > new Date());
		const relevantHourly = {
			...$weather.data.hourly,
			time: $weather.data.hourly.time.slice(nowIdx, nowIdx + 16),
			temp: $weather.data.hourly.temp.slice(nowIdx, nowIdx + 16),
			feelsLike: $weather.data.hourly.feelsLike.slice(nowIdx, nowIdx + 16),
			precipProb: $weather.data.hourly.precipProb.slice(nowIdx, nowIdx + 16),
		};

		return getRecommendation({ ...$weather.data, hourly: relevantHourly }, $preferences);
	});
</script>

<div class="max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 space-y-6 transition-colors duration-200">
	
	<!-- Location Section -->
	<section class="bg-blue-50 dark:bg-slate-700 p-4 rounded-xl space-y-3">
		<div class="flex justify-between items-center mb-2">
			<h2 class="text-lg font-semibold text-blue-900 dark:text-blue-100">Location</h2>
			<button 
				onclick={requestLocation}
				class="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition text-sm"
			>
				📍 Auto
			</button>
		</div>

		<form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); searchLocation(searchQuery); }}>
			<input 
				type="text" 
				bind:value={searchQuery}
				placeholder="Or search city..." 
				class="flex-1 px-3 py-1.5 rounded border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
			/>
			<button type="submit" class="bg-indigo-500 dark:bg-indigo-600 text-white px-3 py-1.5 rounded shadow hover:bg-indigo-600 transition">
				Find
			</button>
		</form>

		{#if $location.searchResults}
			<ul class="bg-white dark:bg-slate-800 border dark:border-slate-600 rounded shadow-sm divide-y dark:divide-slate-600">
				{#each $location.searchResults as res}
					<li>
						<button 
							class="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
							onclick={() => {
								setLocationManual(res.name, res.lat, res.lon);
								searchQuery = '';
							}}
						>
							{res.name} <span class="text-xs text-slate-400 dark:text-slate-500">({res.country})</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		{#if $location.loading}
			<p class="text-blue-600 dark:text-blue-300 text-sm">Getting location...</p>
		{:else if $location.error}
			<p class="text-red-500 text-sm">{$location.error}</p>
		{:else if $location.lat && $location.lon}
			<p class="text-sm text-slate-800 dark:text-slate-200 font-medium">Selected: {$location.name || `${$location.lat.toFixed(2)}, ${$location.lon.toFixed(2)}`}</p>
		{:else}
			<p class="text-sm text-slate-500 dark:text-slate-400">Location not set.</p>
		{/if}
	</section>

	<!-- Weather Section -->
	{#if $weather.loading}
		<p class="text-center animate-pulse text-slate-500 dark:text-slate-400 py-6">Fetching Weather...</p>
	{:else if $weather.error}
		<p class="text-center text-red-500 p-4">{$weather.error}</p>
	{:else if $weather.data}
		<section class="bg-slate-100 dark:bg-slate-700 p-6 rounded-xl text-center space-y-2">
			<h2 class="text-xl font-bold text-slate-700 dark:text-slate-200">Current Weather</h2>
			<div class="text-5xl font-extrabold text-blue-600 dark:text-blue-400 my-4">{$weather.data.current.temp}{$preferences.unitSystem === 'metric' ? '°C' : '°F'}</div>
			<p class="text-slate-600 dark:text-slate-300 font-medium">Feels like <span class="font-bold text-indigo-600 dark:text-indigo-400">{$weather.data.current.feelsLike}{$preferences.unitSystem === 'metric' ? '°C' : '°F'}</span></p>
			<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">(Recommendations use felt temperature)</p>
			<div class="flex justify-center items-center gap-4 mt-4 text-sm text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm w-max mx-auto border border-transparent dark:border-slate-600">
				<div>💨 {$weather.data.current.windSpeed} {$preferences.unitSystem === 'metric' ? 'km/h' : 'mph'}</div>
				<div>🌧️ {$weather.data.daily.precipProbMax}%</div>
			</div>
		</section>

		<!-- Recommendation Section -->
		<section class="bg-indigo-600 dark:bg-indigo-700 text-white p-6 rounded-xl shadow-inner space-y-4">
			<h2 class="text-2xl font-bold border-b border-indigo-400 dark:border-indigo-500 pb-2 flex items-center gap-2">
				👕 Outfit Suggestion
			</h2>
			<div class="space-y-3 pt-2">
				<div class="text-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1">
					<span class="font-semibold text-indigo-200">Tops</span>
					<span>{recommendation()?.tops}</span>
				</div>
				<div class="text-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1">
					<span class="font-semibold text-indigo-200">Bottoms</span>
					<span>{recommendation()?.bottoms}</span>
				</div>
				<div class="mt-4 bg-indigo-800 dark:bg-indigo-900 bg-opacity-40 p-3 rounded text-center text-indigo-100 font-medium border border-indigo-500 dark:border-indigo-600">
					{recommendation()?.accessories}
				</div>
				<p class="text-sm italic text-indigo-100/80 pt-2 border-t border-indigo-500/50">
					{recommendation()?.summary}
				</p>
			</div>
		</section>
	{/if}
</div>
