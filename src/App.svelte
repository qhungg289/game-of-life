<script>
	import { onDestroy, onMount } from "svelte";
	import { create2dArray } from "./utils/utils";

	let grid = [];
	let rows = 60;
	let cols = 80;
	let isRunning = false;
	let speed = 75;
	let canvasElement;
	let canvasCtx;

	const CELL_SIZE = 10;

	function generateNewPattern(value) {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				grid[i][j] =
					typeof value == "number" ? value : Math.floor(Math.random() * 2);
			}
		}
	}

	function countNeighbors(x, y) {
		let count = 0;
		for (let i = -1; i < 2; i++) {
			for (let j = -1; j < 2; j++) {
				const col = (x + j + cols) % cols;
				const row = (y + i + rows) % rows;
				count += grid[row][col];
			}
		}
		count -= grid[y][x];

		return count;
	}

	function computeNextGen() {
		const nextGrid = create2dArray(rows, cols);

		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				const state = grid[i][j];
				const neighbors = countNeighbors(j, i);

				if (state == 0 && neighbors == 3) {
					nextGrid[i][j] = 1;
				} else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
					nextGrid[i][j] = 0;
				} else {
					nextGrid[i][j] = state;
				}
			}
		}

		grid = nextGrid;
	}

	function draw() {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				if (grid[i][j] == 1) {
					canvasCtx.fillRect(
						j * (canvasElement.width / cols),
						i * (canvasElement.height / rows),
						CELL_SIZE,
						CELL_SIZE,
					);
				} else {
					canvasCtx.clearRect(
						j * (canvasElement.width / cols),
						i * (canvasElement.height / rows),
						CELL_SIZE,
						CELL_SIZE,
					);
				}
			}
		}
	}

	onMount(() => {
		grid = create2dArray(rows, cols);
		generateNewPattern();
		canvasCtx = canvasElement.getContext("2d");
		draw();
	});

	// Game loop
	const intervalId = setInterval(() => {
		if (isRunning) {
			computeNextGen();
			draw();
		}
	}, speed);

	// Clear the interval to prevent memory leak
	onDestroy(() => clearInterval(intervalId));
</script>

<main class="flex items-center justify-around h-screen">
	<canvas
		id="canvas"
		width={cols * CELL_SIZE}
		height={rows * CELL_SIZE}
		bind:this={canvasElement}
		class="border-2"
	/>

	<div class="space-y-4">
		<h1 class="text-2xl font-bold">Game of Life</h1>
		<div class="flex flex-col gap-2">
			<!-- Toggle the running state of the game -->
			<button class="bg-gray-300 p-2" on:click={() => (isRunning = !isRunning)}
				>{isRunning ? "Pause" : "Play"}</button
			>
			<button
				class="bg-gray-300 p-2"
				on:click={() => {
					computeNextGen();
					draw();
				}}>Step</button
			>
			<button
				class="bg-gray-300 p-2"
				on:click={() => {
					isRunning = false;
					generateNewPattern();
					draw();
				}}>New pattern</button
			>
			<button
				class="bg-gray-300 p-2"
				on:click={() => {
					isRunning = false;
					grid = create2dArray(rows, cols);
					generateNewPattern(0);
					draw();
				}}>Clear</button
			>
		</div>
	</div>
</main>
