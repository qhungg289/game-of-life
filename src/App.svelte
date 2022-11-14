<script>
	import { onDestroy, onMount } from "svelte";
	import { create2dArray } from "./utils/array";
	import Button from "./libs/Button.svelte";
	import StatsMonitor from "./libs/StatsMonitor.svelte";

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
	let darkMode = false;

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
				// Wrap to the opposite side when reached the edge of the grid
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
				const x = j * (canvasElement.width / cols);
				const y = i * (canvasElement.height / rows);

				if (grid[i][j] == 1) {
					canvasCtx.fillStyle = darkMode ? "#9ca3af" : "#4b5563";
					canvasCtx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
				} else {
					canvasCtx.clearRect(x, y, CELL_SIZE, CELL_SIZE);
				}
			}
		}
	}

	function handleClickOnCanvas(e) {
		// Get the mouse position when click on the canvas
		const rect = canvasElement.getBoundingClientRect();
		const scaleX = canvasElement.width / rect.width;
		const scaleY = canvasElement.height / rect.height;
		const x = Math.floor(((e.clientX - rect.left) * scaleX) / CELL_SIZE);
		const y = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_SIZE);

		console.log({ x, y });

		grid[y][x] = grid[y][x] ? 0 : 1;
		draw();
	}

	$: {
		// Watch the darkMode value to toggle "dark" class on the html element
		document.documentElement.classList.toggle("dark", darkMode);
	}

	onMount(() => {
		grid = create2dArray(rows, cols);
		generateNewPattern();

		// Get the canvas context
		canvasCtx = canvasElement.getContext("2d");
		draw();

		// Check localStorage for darkMode value
		if (localStorage.getItem("darkMode")) {
			darkMode = JSON.parse(localStorage.getItem("darkMode"));
		}
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
	class="flex flex-col lg:flex-row items-center justify-around gap-4 py-4 h-screen"
>
	<canvas
		id="canvas"
		class="select-none w-11/12 lg:w-auto"
		width={cols * CELL_SIZE}
		height={rows * CELL_SIZE}
		bind:this={canvasElement}
		on:click={handleClickOnCanvas}
	/>

	<div
		class="w-full lg:w-auto px-4 lg:px-0 flex lg:flex-col items-start lg:items-center gap-12"
	>
		<h1 class="hidden lg:block text-2xl font-bold">Game of Life</h1>

		<StatsMonitor {gen} {alive} {death} />

		<div class="flex flex-col gap-2 w-full">
			<!-- Toggle the running state of the game -->
			<Button on:buttonClick={() => (isRunning = !isRunning)}>
				{isRunning ? "Pause" : "Play"}
				{#if isRunning}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
						/>
					</svg>
				{/if}
			</Button>
			<Button
				on:buttonClick={() => {
					isRunning = false;
					computeNextGen();
					draw();
				}}
			>
				Step <svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						d="M3.288 4.819A1.5 1.5 0 001 6.095v7.81a1.5 1.5 0 002.288 1.277l6.323-3.905c.155-.096.285-.213.389-.344v2.973a1.5 1.5 0 002.288 1.276l6.323-3.905a1.5 1.5 0 000-2.553L12.288 4.82A1.5 1.5 0 0010 6.095v2.973a1.506 1.506 0 00-.389-.344L3.288 4.82z"
					/>
				</svg>
			</Button>
			<Button
				on:buttonClick={() => {
					isRunning = false;
					generateNewPattern();
					draw();
				}}
			>
				Refresh <svg
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
			</Button>
			<Button
				on:buttonClick={() => {
					isRunning = false;
					grid = create2dArray(rows, cols);
					generateNewPattern(0);
					draw();
				}}
			>
				Clear <svg
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
			</Button>
			<Button
				on:buttonClick={() => {
					darkMode = !darkMode;
					localStorage.setItem("darkMode", JSON.stringify(darkMode));
				}}
			>
				Theme
				{#if !darkMode}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							fill-rule="evenodd"
							d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
			</Button>
		</div>

		<div class="hidden lg:flex flex-col items-center gap-2">
			<a
				class="hover:underline"
				href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
				target="_blank"
				rel="noreferrer">Wiki</a
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
