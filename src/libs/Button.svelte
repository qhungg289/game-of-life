<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
</script>

<button
	class="flex items-center justify-between gap-2 w-full py-2 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
	on:click={() => dispatch("buttonClick")}
>
	<slot />
</button>
