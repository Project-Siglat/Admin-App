<script>
  export let variant = 'contained'; // contained, outlined, text
  export let color = 'primary'; // primary, secondary
  export let size = 'medium'; // small, medium, large
  export let disabled = false;
  export let type = 'button';
  export let fullWidth = false;

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ripple';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    contained: {
      primary: 'bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-500 shadow-material',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400 shadow-material'
    },
    outlined: {
      primary: 'border-2 border-primary-700 text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
      secondary: 'border-2 border-secondary-500 text-secondary-500 hover:bg-secondary-50 focus:ring-secondary-400'
    },
    text: {
      primary: 'text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
      secondary: 'text-secondary-500 hover:bg-secondary-50 focus:ring-secondary-400'
    }
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:bg-gray-300';

  $: buttonClasses = [
    baseClasses,
    sizeClasses[size],
    disabled ? disabledClasses : variantClasses[variant][color],
    fullWidth ? 'w-full' : ''
  ].join(' ');
</script>

<button 
  class={buttonClasses}
  {type}
  {disabled}
  on:click
  {...$$restProps}
>
  <slot />
</button>