<script>
	import { onMount } from 'svelte';
	import { checkAdminExists } from '$lib/api.js';
	import AdminSetupWizard from '$lib/components/AdminSetupWizard.svelte';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import CircularProgress from '$lib/components/CircularProgress.svelte';
	import '../app.css';

	let adminExists = null; // null = loading, true = exists, false = doesn't exist
	let loading = true;

	onMount(async () => {
		try {
			const result = await checkAdminExists();
			adminExists = result.exists;
		} catch (error) {
			console.error('Error checking admin existence:', error);
			adminExists = false; // Default to showing setup wizard on error
		} finally {
			loading = false;
		}
	});

	function handleAdminCreated() {
		adminExists = true;
	}

	function handleLoginSuccess(event) {
		console.log('Login successful:', event.detail);
		// Handle successful login - redirect to dashboard, etc.
		// For now, just log it
	}
</script>

<svelte:head>
	<title>SIGLAT Admin</title>
</svelte:head>

{#if loading}
	<div class="min-h-screen flex flex-col items-center justify-center space-y-4 text-gray-600">
		<CircularProgress size="large" />
		<p class="text-lg">Loading...</p>
	</div>
{:else if adminExists === false}
	<AdminSetupWizard on:adminCreated={handleAdminCreated} />
{:else}
	<LoginForm on:loginSuccess={handleLoginSuccess} />
{/if}