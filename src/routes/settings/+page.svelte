<script lang="ts">
	import { preferences, toggleUnitSystem } from '$lib/stores/preferences';
	import { theme, type Theme } from '$lib/stores/theme';
	import { scheduleDailyNotification } from '$lib/utils/notifications';
</script>

<div class="max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 space-y-6 transition-colors duration-200">
	<h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-700 pb-2">Settings</h1>
	
	<!-- General Settings -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">General</h2>

		<!-- Unit System -->
		<div class="flex items-center justify-between">
			<span class="text-slate-700 dark:text-slate-300 font-medium">Units</span>
			<div class="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
				<button
					class="px-3 py-1 text-sm rounded-md transition {$preferences.unitSystem === 'metric' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}"
					onclick={() => { if ($preferences.unitSystem !== 'metric') toggleUnitSystem(); }}
				>
					Metric (°C)
				</button>
				<button 
					class="px-3 py-1 text-sm rounded-md transition {$preferences.unitSystem === 'imperial' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}"
					onclick={() => { if ($preferences.unitSystem !== 'imperial') toggleUnitSystem(); }}
				>
					Imperial (°F)
				</button>
			</div>
		</div>

		<!-- Theme Setting -->
		<div class="space-y-2">
			<span class="text-slate-700 dark:text-slate-300 font-medium block">Appearance</span>
			<div class="flex gap-2">
				{#each ['light', 'dark', 'system'] as t}
					<button
						class="flex-1 py-2 text-sm font-medium rounded border transition
						{$theme === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}"
						onclick={() => $theme = (t as Theme)}
					>
						{t.charAt(0).toUpperCase() + t.slice(1)}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<hr class="border-slate-100 dark:border-slate-700" />

	<!-- Notifications -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Notifications</h2>

		<div class="flex items-center justify-between">
			<div>
				<span class="text-slate-700 dark:text-slate-300 font-medium block">Daily Recommendation</span>
				<span class="text-xs text-slate-500 dark:text-slate-400">Get an outfit suggestion every morning</span>
			</div>
			<button
				role="switch"
				aria-checked={$preferences.notificationsEnabled}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 {$preferences.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}"
				onclick={() => {
					$preferences.notificationsEnabled = !$preferences.notificationsEnabled;
					scheduleDailyNotification();
				}}
			>
				<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {$preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}"></span>
			</button>
		</div>

		{#if $preferences.notificationsEnabled}
			<div class="flex items-center justify-between animate-in fade-in slide-in-from-top-2">
				<label for="notif-time" class="text-slate-700 dark:text-slate-300 font-medium">Notification Time</label>
				<input
					id="notif-time"
					type="time"
					bind:value={$preferences.notificationTime}
					onchange={scheduleDailyNotification}
					class="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-1 rounded-lg border-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>
		{/if}
	</section>

	<hr class="border-slate-100 dark:border-slate-700" />
	
	<section class="space-y-6">
		<div class="space-y-1">
			<h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Thermal Sensitivity</h2>
			<p class="text-slate-600 dark:text-slate-400 text-sm">
				Adjust how you perceive the cold. Positive values make you feel colder than average.
			</p>
		</div>

		<!-- Sensitivity Slider -->
		<div class="flex flex-col space-y-1">
			<label for="sensitivity" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Sensitivity Offset <span>{$preferences.sensitivity > 0 ? '+' : ''}{$preferences.sensitivity}{$preferences.unitSystem === 'metric' ? '°C' : '°F'} equivalent</span>
			</label>
			<input
				id="sensitivity" type="range"
				min="-5" max="5" step="0.5"
				bind:value={$preferences.sensitivity}
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
		</div>

		<hr class="border-slate-100 dark:border-slate-700" />

		<div class="space-y-1">
			<h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Clothing Thresholds (UTCI)</h2>
			<p class="text-slate-600 dark:text-slate-400 text-sm pb-2">
				Adjust the Universal Thermal Climate Index (UTCI) values for recommendations.
			</p>
		</div>

		<!-- Shorts -->
		<div class="flex flex-col space-y-1">
			<label for="shorts" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Shorts Threshold <span>{$preferences.shortsTemp}{$preferences.unitSystem === 'metric' ? '°C' : '°F'}</span>
			</label>
			<input 
				id="shorts" type="range"
				min={$preferences.unitSystem === 'metric' ? 10 : 50}
				max={$preferences.unitSystem === 'metric' ? 35 : 95}
				step="1"
				bind:value={$preferences.shortsTemp} 
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
		</div>

		<!-- Sweater -->
		<div class="flex flex-col space-y-1">
			<label for="sweater" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Sweater/Hoodie Threshold <span>{$preferences.sweaterTemp}{$preferences.unitSystem === 'metric' ? '°C' : '°F'}</span>
			</label>
			<input 
				id="sweater" type="range"
				min={$preferences.unitSystem === 'metric' ? 10 : 50}
				max={$preferences.unitSystem === 'metric' ? 30 : 86}
				step="1"
				bind:value={$preferences.sweaterTemp} 
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
		</div>

		<!-- Jacket -->
		<div class="flex flex-col space-y-1">
			<label for="jacket" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Light Jacket Threshold <span>{$preferences.jacketTemp}{$preferences.unitSystem === 'metric' ? '°C' : '°F'}</span>
			</label>
			<input 
				id="jacket" type="range"
				min={$preferences.unitSystem === 'metric' ? 0 : 32}
				max={$preferences.unitSystem === 'metric' ? 25 : 77}
				step="1"
				bind:value={$preferences.jacketTemp} 
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
		</div>

		<!-- Heavy Jacket -->
		<div class="flex flex-col space-y-1">
			<label for="heavyJacket" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Heavy Jacket Threshold <span>{$preferences.heavyJacketTemp}{$preferences.unitSystem === 'metric' ? '°C' : '°F'}</span>
			</label>
			<input 
				id="heavyJacket" type="range"
				min={$preferences.unitSystem === 'metric' ? -10 : 14}
				max={$preferences.unitSystem === 'metric' ? 15 : 59}
				step="1"
				bind:value={$preferences.heavyJacketTemp} 
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
		</div>

		<!-- Accessories -->
		<div class="flex flex-col space-y-1">
			<label for="accessories" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Gloves/Hat Threshold <span>{$preferences.accessoriesTemp}{$preferences.unitSystem === 'metric' ? '°C' : '°F'}</span>
			</label>
			<input
				id="accessories" type="range"
				min={$preferences.unitSystem === 'metric' ? -20 : -4}
				max={$preferences.unitSystem === 'metric' ? 10 : 50}
				step="1"
				bind:value={$preferences.accessoriesTemp}
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
		</div>

		<hr class="border-slate-100 dark:border-slate-700" />

		<!-- CLO Values (Advanced) -->
		<details class="group">
			<summary class="flex items-center justify-between cursor-pointer list-none">
				<h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Advanced Clothing Insulation (CLO)</h2>
				<span class="transition group-open:rotate-180">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
				</span>
			</summary>
			<div class="space-y-4 pt-4">
				{#each Object.keys($preferences.cloValues) as item}
					{@const key = item as keyof typeof $preferences.cloValues}
					<div class="flex flex-col space-y-1">
						<label for="clo-{item}" class="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between capitalize">
							{item.replace(/([A-Z])/g, ' $1')} <span>{$preferences.cloValues[key].toFixed(2)} CLO</span>
						</label>
						<input
							id="clo-{item}" type="range" min="0" max="1.5" step="0.05"
							bind:value={$preferences.cloValues[key]}
							class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
						/>
					</div>
				{/each}
			</div>
		</details>

		<hr class="border-slate-100 dark:border-slate-700" />

		<!-- Umbrella -->
		<div class="flex flex-col space-y-1">
			<label for="umbrella" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Umbrella Probability <span>{$preferences.umbrellaProb}%</span>
			</label>
			<input 
				id="umbrella" type="range" min="10" max="100" step="5" 
				bind:value={$preferences.umbrellaProb} 
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
		</div>
	</section>

	<div class="pt-4 mt-4 border-t dark:border-slate-700 text-center text-sm text-slate-400 dark:text-slate-500">
		Preferences are automatically saved to your device.
	</div>
</div>