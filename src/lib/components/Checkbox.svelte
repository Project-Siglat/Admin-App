<script>
  export let checked = false;
  export let disabled = false;
  export let label = '';
  export let color = 'primary';

  const colorClasses = {
    primary: 'text-primary-700 focus:ring-primary-500',
    secondary: 'text-secondary-500 focus:ring-secondary-400'
  };
</script>

<label class="flex items-center space-x-3 cursor-pointer {disabled ? 'opacity-50 cursor-not-allowed' : ''}">
  <input
    type="checkbox"
    bind:checked
    {disabled}
    class="h-4 w-4 rounded border-gray-300 {colorClasses[color]} focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
    on:change
    {...$$restProps}
  />
  {#if label}
    <span class="text-sm text-gray-900">{label}</span>
  {:else}
    <slot />
  {/if}
</label>