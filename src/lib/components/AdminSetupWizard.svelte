<script>
	import Card from '@smui/card';
	import Button from '@smui/button';
	import Textfield from '@smui/textfield';
	import FormField from '@smui/form-field';
	import CircularProgress from '@smui/circular-progress';
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
			case 'weak': return '#f44336';
			case 'medium': return '#ff9800';
			case 'strong': return '#4caf50';
			case 'very-strong': return '#2e7d32';
			default: return '#9e9e9e';
		}
	}
</script>

<div class="wizard-container">
	<Card style="width: 100%; max-width: 480px; padding: 32px;">
		<div class="wizard-header">
			<h1 class="wizard-title">Welcome to SIGLAT Admin</h1>
			<p class="wizard-subtitle">
				No admin account found. Create your secure admin account to get started.
			</p>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="wizard-form">
			<div class="form-group">
				<Textfield
					bind:value={email}
					label="Admin Email"
					type="email"
					required
					style="width: 100%;"
					disabled={loading}
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
				/>
				
				{#if password}
					<div class="password-strength">
						<div class="strength-bar">
							<div 
								class="strength-fill" 
								style="width: {passwordValidation.strength === 'weak' ? '25%' : passwordValidation.strength === 'medium' ? '50%' : passwordValidation.strength === 'strong' ? '75%' : '100%'}; background-color: {getStrengthColor(passwordValidation.strength)}"
							></div>
						</div>
						<span class="strength-text" style="color: {getStrengthColor(passwordValidation.strength)}">
							{passwordValidation.strength.replace('-', ' ').toUpperCase()}
						</span>
					</div>

					{#if passwordValidation.errors.length > 0}
						<div class="password-errors">
							{#each passwordValidation.errors as error}
								<div class="error-item">• {error}</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>

			<div class="form-group">
				<Textfield
					bind:value={confirmPassword}
					label="Confirm Password"
					type={showPassword ? 'text' : 'password'}
					required
					style="width: 100%;"
					disabled={loading}
				/>
				
				{#if confirmPassword && !passwordsMatch}
					<div class="password-mismatch">Passwords do not match</div>
				{/if}
			</div>

			<FormField>
				<input 
					type="checkbox" 
					bind:checked={showPassword} 
					disabled={loading}
				/>
				<span slot="label">Show passwords</span>
			</FormField>

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<div class="wizard-actions">
				<Button 
					variant="raised" 
					style="width: 100%; background-color: var(--mdc-theme-primary); color: var(--mdc-theme-on-primary);"
					disabled={!canSubmit}
				>
					{#if loading}
						<CircularProgress style="height: 20px; width: 20px;" indeterminate />
					{:else}
						Create Admin Account
					{/if}
				</Button>
			</div>
		</form>

		<div class="security-notice">
			<h4>Security Requirements:</h4>
			<ul>
				<li>Minimum 12 characters</li>
				<li>Must include uppercase and lowercase letters</li>
				<li>Must include numbers and special characters</li>
				<li>No repeated characters or common patterns</li>
			</ul>
		</div>
	</Card>
</div>

<style>
	.wizard-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 20px;
		background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
	}

	.wizard-header {
		text-align: center;
		margin-bottom: 32px;
	}

	.wizard-title {
		font-size: 2rem;
		font-weight: 500;
		color: var(--mdc-theme-primary);
		margin: 0 0 16px 0;
	}

	.wizard-subtitle {
		font-size: 1rem;
		color: #666;
		margin: 0;
		line-height: 1.5;
	}

	.wizard-form {
		width: 100%;
	}

	.form-group {
		margin-bottom: 24px;
	}

	.password-strength {
		margin-top: 8px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.strength-bar {
		flex: 1;
		height: 4px;
		background-color: #e0e0e0;
		border-radius: 2px;
		overflow: hidden;
	}

	.strength-fill {
		height: 100%;
		transition: width 0.3s ease, background-color 0.3s ease;
		border-radius: 2px;
	}

	.strength-text {
		font-size: 0.75rem;
		font-weight: 500;
		min-width: 80px;
	}

	.password-errors {
		margin-top: 8px;
		padding: 12px;
		background-color: #ffebee;
		border-radius: 4px;
		border-left: 4px solid #f44336;
	}

	.error-item {
		font-size: 0.875rem;
		color: #d32f2f;
		margin-bottom: 4px;
	}

	.error-item:last-child {
		margin-bottom: 0;
	}

	.password-mismatch {
		margin-top: 8px;
		color: #f44336;
		font-size: 0.875rem;
	}

	.error-message {
		background-color: #ffebee;
		color: #d32f2f;
		padding: 12px;
		border-radius: 4px;
		margin-bottom: 16px;
		border-left: 4px solid #f44336;
	}

	.wizard-actions {
		margin-top: 32px;
	}

	.security-notice {
		margin-top: 32px;
		padding: 16px;
		background-color: #f5f5f5;
		border-radius: 8px;
		border-left: 4px solid var(--mdc-theme-primary);
	}

	.security-notice h4 {
		margin: 0 0 12px 0;
		color: var(--mdc-theme-primary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.security-notice ul {
		margin: 0;
		padding-left: 20px;
		font-size: 0.875rem;
		color: #666;
	}

	.security-notice li {
		margin-bottom: 4px;
	}
</style>