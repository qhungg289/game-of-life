<script>
	export let gen;
	export let alive;
	export let death;
</script>

<div
	class="flex flex-col items-center gap-2 w-full py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-800"
>
	<p class="flex justify-between gap-2 w-full">
		Gen <span class="font-semibold">{gen}</span>
	</p>
	<p class="flex justify-between gap-2 w-full">
		Alive <span class="font-semibold">{alive}</span>
	</p>
	<p class="flex justify-between gap-2 w-full">
		Death <span class="font-semibold">{death}</span>
	</p>
</div>
