<script>
  export let elevation = 1; // 0-4
  export let outlined = false;

  const elevationClasses = {
    0: '',
    1: 'shadow-material',
    2: 'shadow-material-lg',
    3: 'shadow-xl',
    4: 'shadow-2xl'
  };

  $: cardClasses = [
    'bg-white rounded-lg overflow-hidden transition-shadow duration-200',
    outlined ? 'border border-gray-200' : '',
    elevationClasses[elevation]
  ].join(' ');
</script>

<div class={cardClasses} {...$$restProps}>
  <slot />
</div>