<script>
	import Card from './Card.svelte';
	import Button from './Button.svelte';
	import TextField from './TextField.svelte';
	import Checkbox from './Checkbox.svelte';
	import CircularProgress from './CircularProgress.svelte';
	import { createAdmin } from '$lib/api.js';
	import { validatePassword } from '$lib/password.js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';
	let passwordValidation = { isValid: false, errors: [], strength: 'weak' };
	let showPassword = false;

	$: {
		if (password) {
			passwordValidation = validatePassword(password);
		}
	}

	$: passwordsMatch = password === confirmPassword && confirmPassword !== '';
	$: canSubmit = email && passwordValidation.isValid && passwordsMatch && !loading;

	async function handleSubmit() {
		if (!canSubmit) return;

		loading = true;
		error = '';

		try {
			await createAdmin(email, password);
			dispatch('adminCreated');
		} catch (err) {
			error = err.message || 'Failed to create admin account';
		} finally {
			loading = false;
		}
	}

	function getStrengthColor(strength) {
		switch (strength) {
			case 'weak': return 'bg-red-500';
			case 'medium': return 'bg-yellow-500';
			case 'strong': return 'bg-green-500';
			case 'very-strong': return 'bg-green-600';
			default: return 'bg-gray-300';
		}
	}

	function getStrengthWidth(strength) {
		switch (strength) {
			case 'weak': return 'w-1/4';
			case 'medium': return 'w-2/4';
			case 'strong': return 'w-3/4';
			case 'very-strong': return 'w-full';
			default: return 'w-0';
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-white to-gray-50">
	<Card elevation={2} class="w-full max-w-md p-8">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-medium text-primary-700 mb-4">Welcome to SIGLAT Admin</h1>
			<p class="text-gray-600 leading-relaxed">
				No admin account found. Create your secure admin account to get started.
			</p>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<TextField
				bind:value={email}
				label="Admin Email"
				type="email"
				required
				fullWidth
				disabled={loading}
			/>

			<div class="space-y-2">
				<TextField
					bind:value={password}
					label="Password"
					type={showPassword ? 'text' : 'password'}
					required
					fullWidth
					disabled={loading}
				/>
				
				{#if password}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-600">Password strength:</span>
							<span class="text-sm font-medium capitalize {passwordValidation.strength === 'weak' ? 'text-red-500' : passwordValidation.strength === 'medium' ? 'text-yellow-600' : 'text-green-600'}">
								{passwordValidation.strength.replace('-', ' ')}
							</span>
						</div>
						<div class="w-full bg-gray-200 rounded-full h-1">
							<div class="h-1 rounded-full transition-all duration-300 {getStrengthColor(passwordValidation.strength)} {getStrengthWidth(passwordValidation.strength)}"></div>
						</div>

						{#if passwordValidation.errors.length > 0}
							<div class="bg-red-50 border-l-4 border-red-400 p-3 rounded">
								{#each passwordValidation.errors as error}
									<div class="text-sm text-red-700">• {error}</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<div class="space-y-2">
				<TextField
					bind:value={confirmPassword}
					label="Confirm Password"
					type={showPassword ? 'text' : 'password'}
					required
					fullWidth
					disabled={loading}
					error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : ''}
				/>
			</div>

			<Checkbox
				bind:checked={showPassword}
				disabled={loading}
				label="Show passwords"
			/>

			{#if error}
				<div class="bg-red-50 border-l-4 border-red-400 p-4 rounded">
					<p class="text-red-700">{error}</p>
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
					<CircularProgress size="small" color="primary" />
					<span class="ml-2">Creating Account...</span>
				{:else}
					Create Admin Account
				{/if}
			</Button>
		</form>

		<div class="mt-8 bg-gray-50 border-l-4 border-primary-700 p-4 rounded">
			<h4 class="text-sm font-medium text-primary-700 mb-3">Security Requirements:</h4>
			<ul class="text-sm text-gray-600 space-y-1">
				<li>• Minimum 12 characters</li>
				<li>• Must include uppercase and lowercase letters</li>
				<li>• Must include numbers and special characters</li>
				<li>• No repeated characters or common patterns</li>
			</ul>
		</div>
	</Card>
</div>