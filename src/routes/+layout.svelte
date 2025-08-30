<script lang="ts">
	import type { LayoutData } from './$types';
	
	export let data: LayoutData;
</script>

<main class="min-h-screen">
	<slot />
</main>