<script>
	import { onDestroy, onMount } from "svelte";
	import { create2dArray } from "./utils/utils";

	let grid = [];
	let rows = 60;
	let cols = 100;
	let isRunning = false;
	let speed = 85;
	let gen = 0;
	let alive = 0;
	let death = 0;
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

		gen = 0;
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
		gen += 1;
	}

	function draw() {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				if (grid[i][j] == 1) {
					canvasCtx.fillStyle = "#9ca3af";
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

	function handleClickOnCanvas(e) {
		const rect = canvasElement.getBoundingClientRect();
		// Get the mouse position when click on the canvas
		const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
		const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
		grid[y][x] = grid[y][x] ? 0 : 1;
		draw();
	}

	onMount(() => {
		grid = create2dArray(rows, cols);
		generateNewPattern();

		// Get the canvas context
		canvasCtx = canvasElement.getContext("2d");
		draw();
	});

	// Main game loop
	const intervalId = setInterval(() => {
		if (isRunning) {
			computeNextGen();
			draw();
		}
	}, speed);

	$: {
		alive = 0;
		grid.forEach((row) => {
			row.forEach((cell) => {
				if (cell) {
					alive += 1;
				}
			});
		});

		death = rows * cols - alive;
	}

	// Clear the interval to prevent memory leak
	onDestroy(() => clearInterval(intervalId));
</script>

<main
	class="flex flex-col md:flex-row items-center justify-around gap-4 h-screen"
>
	<canvas
		id="canvas"
		class="border-4 border-gray-800 rounded-md select-none w-4/5 md:w-auto"
		width={cols * CELL_SIZE}
		height={rows * CELL_SIZE}
		bind:this={canvasElement}
		on:click={handleClickOnCanvas}
	/>

	<div class="flex md:flex-col items-start md:items-center gap-12">
		<h1 class="hidden md:block text-2xl font-bold">Game of Life</h1>
		<div
			class="flex flex-col items-center gap-2 w-full py-2 px-4 rounded-lg bg-gray-800"
		>
			<p class="flex justify-between w-full">Gen <span>{gen}</span></p>
			<p class="flex justify-between w-full">Alive <span>{alive}</span></p>
			<p class="flex justify-between w-full">Death <span>{death}</span></p>
		</div>
		<div class="flex flex-col gap-2">
			<!-- Toggle the running state of the game -->
			<button
				class="flex items-center justify-between gap-2 py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
				on:click={() => (isRunning = !isRunning)}
				>{isRunning ? "Pause" : "Play"}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						d="M12.75 4a.75.75 0 00-.75.75v10.5c0 .414.336.75.75.75h.5a.75.75 0 00.75-.75V4.75a.75.75 0 00-.75-.75h-.5zM17.75 4a.75.75 0 00-.75.75v10.5c0 .414.336.75.75.75h.5a.75.75 0 00.75-.75V4.75a.75.75 0 00-.75-.75h-.5zM3.288 4.819A1.5 1.5 0 001 6.095v7.81a1.5 1.5 0 002.288 1.277l6.323-3.906a1.5 1.5 0 000-2.552L3.288 4.819z"
					/>
				</svg>
			</button>
			<button
				class="flex items-center justify-between gap-2 py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
				on:click={() => {
					computeNextGen();
					draw();
				}}
				>Step <svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						d="M3.288 4.819A1.5 1.5 0 001 6.095v7.81a1.5 1.5 0 002.288 1.277l6.323-3.905c.155-.096.285-.213.389-.344v2.973a1.5 1.5 0 002.288 1.276l6.323-3.905a1.5 1.5 0 000-2.553L12.288 4.82A1.5 1.5 0 0010 6.095v2.973a1.506 1.506 0 00-.389-.344L3.288 4.82z"
					/>
				</svg>
			</button>
			<button
				class="flex items-center justify-between gap-2 py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
				on:click={() => {
					isRunning = false;
					generateNewPattern();
					draw();
				}}
				>New pattern <svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						fill-rule="evenodd"
						d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
			<button
				class="flex items-center justify-between gap-2 py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
				on:click={() => {
					isRunning = false;
					grid = create2dArray(rows, cols);
					generateNewPattern(0);
					draw();
				}}
				>Clear <svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>

		<div class="hidden md:flex flex-col items-center gap-2">
			<a
				class="hover:underline"
				href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
				target="_blank"
				rel="noreferrer">Rules</a
			>
			<a
				class="hover:underline"
				href="https://github.com/qhungg289/game-of-life"
				target="_blank"
				rel="noreferrer">Repo</a
			>
		</div>
	</div>
</main>
