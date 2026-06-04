<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	// Initialize theme on layout load so the store subscribes and handles logic
	import '$lib/stores/theme';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>WearCast</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 flex flex-col">
	<nav class="bg-indigo-600 dark:bg-indigo-900 text-white shadow-md w-full">
		<div class="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
			<a href="/" class="text-xl font-bold tracking-wide">🌤️ WearCast</a>
			<div class="space-x-4">
				<a href="/" class="hover:text-indigo-200 transition {$page.url.pathname === '/' ? 'font-semibold underline' : ''}">Home</a>
				<a href="/settings" class="hover:text-indigo-200 transition {$page.url.pathname === '/settings' ? 'font-semibold underline' : ''}">Settings</a>
			</div>
		</div>
	</nav>
	
	<main class="flex-grow flex flex-col items-center p-6">
		{@render children()}
	</main>
</div>
