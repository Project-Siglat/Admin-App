<script>
  export let size = 'medium'; // small, medium, large
  export let color = 'primary';

  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6', 
    large: 'h-8 w-8'
  };

  const colorClasses = {
    primary: 'text-primary-700',
    secondary: 'text-secondary-500'
  };
</script>

<div class="flex items-center justify-center">
  <svg 
    class="animate-spin {sizeClasses[size]} {colorClasses[color]}" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      class="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      stroke-width="4"
    ></circle>
    <path 
      class="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
</div>