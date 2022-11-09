<script>
	import { onDestroy, onMount } from "svelte";
	import { v4 as uuidv4 } from "uuid";

	let rows = 20;
	let cols = 40;
	let grid = [];
	let nextGrid = [];
	let isRunning = false;
	let speed = 1000;

	function generateNewPattern() {
		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				grid[i][j] = Math.floor(Math.random() * 2);
			}
		}
	}

	function countNeighbors(x, y) {}

	$: {
		grid = new Array(rows);
		for (let i = 0; i < grid.length; i++) {
			grid[i] = new Array(cols);
		}
		generateNewPattern();
	}
	// $: console.table(grid);

	const intervalId = setInterval(() => {
		if (isRunning) {
			console.log("tick");
		}
	}, speed);

	onDestroy(() => clearInterval(intervalId));
</script>

<main class="flex flex-col items-center gap-4 mt-4">
	<h1 class="text-2xl font-bold">Conway's Game of Life</h1>
	<div>
		<div>
			<label for="rows">Rows</label>
			<input
				type="number"
				id="rows"
				class="text-right"
				bind:value={rows}
				min="5"
			/>
		</div>
		<div>
			<label for="cols">Cols</label>
			<input
				type="number"
				id="cols"
				class="text-right"
				bind:value={cols}
				min="5"
			/>
		</div>
	</div>
	<div class="flex gap-2">
		<button class="bg-gray-300 p-2" on:click={() => (isRunning = !isRunning)}
			>Running: {isRunning}</button
		>
		<button class="bg-gray-300 p-2" on:click={generateNewPattern}
			>New pattern</button
		>
	</div>
	<div
		style:display="grid"
		style:grid-template-columns={`repeat(${cols}, minmax(0, 1rem))`}
		style:grid-template-rows={`repeat(${rows}, minmax(0, 1rem))`}
	>
		{#each grid as row}
			{#each row as cell (uuidv4())}
				<div style:background-color={cell ? "black" : "white"} />
			{/each}
		{/each}
	</div>
</main>
