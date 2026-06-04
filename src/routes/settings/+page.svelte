<script lang="ts">
	import { preferences } from '$lib/stores/preferences';
	import { theme, type Theme } from '$lib/stores/theme';
</script>

<div class="max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 space-y-6 transition-colors duration-200">
	<h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-700 pb-2">Settings</h1>
	
	<!-- Theme Setting -->
	<section class="space-y-3">
		<h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Appearance</h2>
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
	</section>

	<hr class="border-slate-100 dark:border-slate-700" />
	
	<section class="space-y-4">
		<div class="space-y-1">
			<h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Clothing Thresholds</h2>
			<p class="text-slate-600 dark:text-slate-400 text-sm pb-2">
				Adjust the felt temperatures at which WearCast recommends certain types of clothing. 
			</p>
		</div>

		<!-- Shorts -->
		<div class="flex flex-col space-y-1">
			<label for="shorts" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Shorts Threshold <span>{$preferences.shortsTemp}°C</span>
			</label>
			<input 
				id="shorts" type="range" min="10" max="35" step="1" 
				bind:value={$preferences.shortsTemp} 
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
			<span class="text-xs text-slate-500 dark:text-slate-400">Recommend shorts if felt temp >= {$preferences.shortsTemp}°C</span>
		</div>
		
		<hr class="border-slate-100 dark:border-slate-700" />

		<!-- Sweater -->
		<div class="flex flex-col space-y-1">
			<label for="sweater" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Sweater/Hoodie Threshold <span>{$preferences.sweaterTemp}°C</span>
			</label>
			<input 
				id="sweater" type="range" min="10" max="30" step="1" 
				bind:value={$preferences.sweaterTemp} 
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
			<span class="text-xs text-slate-500 dark:text-slate-400">Recommend long sleeves if felt temp &lt;= {$preferences.sweaterTemp}°C</span>
		</div>

		<hr class="border-slate-100 dark:border-slate-700" />

		<!-- Jacket -->
		<div class="flex flex-col space-y-1">
			<label for="jacket" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Light Jacket Threshold <span>{$preferences.jacketTemp}°C</span>
			</label>
			<input 
				id="jacket" type="range" min="0" max="25" step="1" 
				bind:value={$preferences.jacketTemp} 
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
			<span class="text-xs text-slate-500 dark:text-slate-400">Recommend jacket if felt temp &lt;= {$preferences.jacketTemp}°C</span>
		</div>

		<hr class="border-slate-100 dark:border-slate-700" />

		<!-- Heavy Jacket -->
		<div class="flex flex-col space-y-1">
			<label for="heavyJacket" class="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
				Heavy Jacket Threshold <span>{$preferences.heavyJacketTemp}°C</span>
			</label>
			<input 
				id="heavyJacket" type="range" min="-10" max="15" step="1" 
				bind:value={$preferences.heavyJacketTemp} 
				class="w-full accent-indigo-600 dark:accent-indigo-400"
			/>
			<span class="text-xs text-slate-500 dark:text-slate-400">Recommend heavy jacket if felt temp &lt;= {$preferences.heavyJacketTemp}°C</span>
		</div>

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
			<span class="text-xs text-slate-500 dark:text-slate-400">Recommend umbrella if rain chance >= {$preferences.umbrellaProb}%</span>
		</div>
	</section>

	<div class="pt-4 mt-4 border-t dark:border-slate-700 text-center text-sm text-slate-400 dark:text-slate-500">
		Preferences are automatically saved to your device.
	</div>
</div>