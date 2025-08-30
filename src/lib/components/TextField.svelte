<script>
  export let label = '';
  export let value = '';
  export let type = 'text';
  export let required = false;
  export let disabled = false;
  export let error = '';
  export let helperText = '';
  export let variant = 'outlined'; // outlined, filled
  export let fullWidth = false;

  let focused = false;
  let inputElement;

  const baseClasses = 'block w-full border-0 bg-transparent text-gray-900 placeholder-transparent focus:outline-none focus:ring-0';
  
  const containerClasses = {
    outlined: 'relative border-2 rounded transition-colors duration-200',
    filled: 'relative bg-gray-50 border-b-2 border-t-0 border-l-0 border-r-0 rounded-t transition-colors duration-200'
  };

  const borderClasses = {
    normal: 'border-gray-300 focus-within:border-primary-700',
    error: 'border-red-500 focus-within:border-red-500'
  };

  const labelClasses = 'absolute left-3 transition-all duration-200 pointer-events-none';
  
  $: hasValue = value !== '';
  $: isFloating = focused || hasValue;
  $: containerClass = [
    containerClasses[variant],
    error ? borderClasses.error : borderClasses.normal,
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 bg-gray-100' : ''
  ].join(' ');

  $: labelClass = [
    labelClasses,
    isFloating 
      ? variant === 'outlined' 
        ? '-top-2 left-2 text-xs bg-white px-1'
        : 'top-2 text-xs'
      : variant === 'outlined'
        ? 'top-3 text-base'
        : 'top-4 text-base',
    error ? 'text-red-500' : (focused ? 'text-primary-700' : 'text-gray-600')
  ].join(' ');
</script>

<div class="relative {fullWidth ? 'w-full' : ''}">
  <div class={containerClass}>
    <input
      bind:this={inputElement}
      bind:value
      {type}
      {required}
      {disabled}
      class="{baseClasses} {variant === 'outlined' ? 'px-3 py-3' : 'px-3 py-4 pb-2'}"
      placeholder=" "
      on:focus={() => focused = true}
      on:blur={() => focused = false}
      on:input
      {...$$restProps}
    />
    <label class={labelClass}>
      {label}
    </label>
  </div>
  
  {#if error}
    <p class="mt-1 text-sm text-red-500">{error}</p>
  {:else if helperText}
    <p class="mt-1 text-sm text-gray-600">{helperText}</p>
  {/if}
</div>