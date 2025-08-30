<script>
	import Card from './Card.svelte';
	import Button from './Button.svelte';
	import TextField from './TextField.svelte';
	import Checkbox from './Checkbox.svelte';
	import CircularProgress from './CircularProgress.svelte';
	import { login } from '$lib/api.js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	let showPassword = false;

	$: canSubmit = email && password && !loading;

	async function handleSubmit() {
		if (!canSubmit) return;

		loading = true;
		error = '';

		try {
			const result = await login(email, password);
			// Store token if needed
			if (result.token) {
				localStorage.setItem('authToken', result.token);
			}
			dispatch('loginSuccess', result);
		} catch (err) {
			error = err.message || 'Login failed. Please check your credentials.';
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter' && canSubmit) {
			handleSubmit();
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-white to-gray-50">
	<Card elevation={2} class="w-full max-w-sm p-8">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-medium text-primary-700 mb-2">SIGLAT Admin</h1>
			<p class="text-gray-600">Sign in to your admin account</p>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<TextField
				bind:value={email}
				label="Email"
				type="email"
				required
				fullWidth
				disabled={loading}
				on:keypress={handleKeyPress}
			/>

			<TextField
				bind:value={password}
				label="Password"
				type={showPassword ? 'text' : 'password'}
				required
				fullWidth
				disabled={loading}
				on:keypress={handleKeyPress}
			/>

			<Checkbox
				bind:checked={showPassword}
				disabled={loading}
				label="Show password"
			/>

			{#if error}
				<div class="bg-red-50 border-l-4 border-red-400 p-4 rounded">
					<p class="text-sm text-red-700">{error}</p>
				</div>
			{/if}

			<Button 
				type="submit"
				variant="contained"
				color="primary"
				fullWidth
				disabled={!canSubmit}
				size="large"
			>
				{#if loading}
					<CircularProgress size="small" />
					<span class="ml-2">Signing in...</span>
				{:else}
					Sign In
				{/if}
			</Button>
		</form>
	</Card>
</div>