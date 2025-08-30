<script>
	import Card from '@smui/card';
	import Button from '@smui/button';
	import Textfield from '@smui/textfield';
	import FormField from '@smui/form-field';
	import CircularProgress from '@smui/circular-progress';
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

<div class="login-container">
	<Card style="width: 100%; max-width: 400px; padding: 32px;">
		<div class="login-header">
			<h1 class="login-title">SIGLAT Admin</h1>
			<p class="login-subtitle">Sign in to your admin account</p>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="login-form">
			<div class="form-group">
				<Textfield
					bind:value={email}
					label="Email"
					type="email"
					required
					style="width: 100%;"
					disabled={loading}
					on:keypress={handleKeyPress}
				/>
			</div>

			<div class="form-group">
				<Textfield
					bind:value={password}
					label="Password"
					type={showPassword ? 'text' : 'password'}
					required
					style="width: 100%;"
					disabled={loading}
					on:keypress={handleKeyPress}
				/>
			</div>

			<FormField style="margin-bottom: 16px;">
				<input 
					type="checkbox" 
					bind:checked={showPassword} 
					disabled={loading}
				/>
				<span slot="label">Show password</span>
			</FormField>

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<div class="login-actions">
				<Button 
					variant="raised" 
					style="width: 100%; background-color: var(--mdc-theme-primary); color: var(--mdc-theme-on-primary);"
					disabled={!canSubmit}
				>
					{#if loading}
						<CircularProgress style="height: 20px; width: 20px;" indeterminate />
					{:else}
						Sign In
					{/if}
				</Button>
			</div>
		</form>
	</Card>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 20px;
		background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
	}

	.login-header {
		text-align: center;
		margin-bottom: 32px;
	}

	.login-title {
		font-size: 2rem;
		font-weight: 500;
		color: var(--mdc-theme-primary);
		margin: 0 0 8px 0;
	}

	.login-subtitle {
		font-size: 1rem;
		color: #666;
		margin: 0;
	}

	.login-form {
		width: 100%;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.error-message {
		background-color: #ffebee;
		color: #d32f2f;
		padding: 12px;
		border-radius: 4px;
		margin-bottom: 16px;
		border-left: 4px solid #f44336;
		font-size: 0.875rem;
	}

	.login-actions {
		margin-top: 24px;
	}
</style>