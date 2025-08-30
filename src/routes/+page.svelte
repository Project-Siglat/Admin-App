<script>
	import { onMount } from 'svelte';
	import { checkAdminExists } from '$lib/api.js';
	import AdminSetupWizard from '$lib/components/AdminSetupWizard.svelte';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import CircularProgress from '@smui/circular-progress';

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
	<div class="loading-container">
		<CircularProgress style="height: 40px; width: 40px;" indeterminate />
		<p>Loading...</p>
	</div>
{:else if adminExists === false}
	<AdminSetupWizard on:adminCreated={handleAdminCreated} />
{:else}
	<LoginForm on:loginSuccess={handleLoginSuccess} />
{/if}

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		gap: 16px;
		color: #666;
	}
</style>