<script lang="ts" context="module">
	let defaultSceneCtx = {
		s: 1,
		width: 0,
		height: 0,
		cursor: {
			x: 0,
			y: 0,
			gridX: 0,
			gridY: 0,
			prevGridX: 0,
			prevGridY: 0,
			px: 0,
			py: 0,
			activeX: 0,
			activeY: 0,
			active: false,
			lastPoll: 0
		}
	};
	type SceneContext = typeof defaultSceneCtx;

	export type { SceneContext };
</script>

<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import type { CanvasObject } from "./objects/CanvasObject";
	import { PixelGrid } from "./objects/PixelGrid";

	let { color = "#000000", pixelAmount = $bindable(1) } = $props();

	const disp = createEventDispatcher();

	let loadErr: Error | null = null;
	let canvasContainer: HTMLElement;
	let canvas: HTMLCanvasElement;
	let rctx: CanvasRenderingContext2D | null;
	let sctx: SceneContext = $state(defaultSceneCtx);

	const GRID_SIZE = 256;
	const PIXEL_WORLD_SIZE = 1;
	const gridWorldSize = GRID_SIZE * PIXEL_WORLD_SIZE;

	let objects: Record<string, CanvasObject> = $state({});

	const adjustSizeAndScale = () => {
		if (!canvasContainer || !canvas) return;

		const style = window.getComputedStyle(canvasContainer);
		const maxWidth = parseFloat(style.maxWidth) || sctx.width;
		const availableWidth = Math.min(
			canvasContainer.parentElement?.clientWidth || window.innerWidth,
			maxWidth
		);

		const targetPixelScale = Math.max(1, Math.floor(availableWidth / GRID_SIZE));

		const containerSize = GRID_SIZE * targetPixelScale;

		canvasContainer.style.width = `${containerSize}px`;
		canvasContainer.style.height = `${containerSize}px`;

		canvas.width = containerSize;
		canvas.height = containerSize;
		sctx.width = containerSize;
		sctx.height = containerSize;
		sctx.s = targetPixelScale;

		if (rctx) {
			rctx = canvas.getContext("2d");
			if (rctx) {
				rctx.imageSmoothingEnabled = false;
			}
		}
	};

	const init = (): Error | null => {
		let err: Error | null;

		err = initObjects();
		if (err !== null) return err;
		err = initCanvas();
		if (err !== null) return err;
		initListeners();
		startRoutines();

		disp("load");

		return null;
	};

	const initCanvas = (): Error | null => {
		rctx = canvas.getContext("2d");
		if (!rctx) return new Error("Cannot initialize canvas context");

		rctx.imageSmoothingEnabled = false;

		return null;
	};

	const initObjects = (): Error | null => {
		const pixelGrid = new PixelGrid(0, 0, 1, "pixelGrid");
		objects["pixelGrid"] = pixelGrid;
		return null;
	};

	const initListeners = () => {
		canvas.addEventListener("mousemove", onMouseMove);
		canvas.addEventListener("mousedown", onMouseDown);
		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("resize", adjustSizeAndScale);
	};

	const placePixel = (canvasX: number, canvasY: number) => {
		if (!objects.pixelGrid || sctx.s === 0) {
			return;
		}

		const grid = objects.pixelGrid as PixelGrid;
		const halfGrid = grid.gridSize / 2;

		const worldX = canvasX / sctx.s - halfGrid;
		const worldY = canvasY / sctx.s - halfGrid;

		const gridX = Math.floor(worldX / PIXEL_WORLD_SIZE);
		const gridY = Math.floor(worldY / PIXEL_WORLD_SIZE);

		const isInBounds =
			gridX >= -halfGrid && gridX < halfGrid && gridY >= -halfGrid && gridY < halfGrid;

		if (isInBounds) {
			const key = `${gridX},${gridY}`;
			const currentPixelData = grid.pixels[key];
			const isNewPixel = !currentPixelData;
			const needsColorUpdate = isNewPixel || currentPixelData?.color !== color;

			if (needsColorUpdate) {
				grid.addOrUpdatePixel(gridX, gridY, {
					color,
					lastedEditedUserID: null,
					lastedEditedName: null
				});
				if (isNewPixel && pixelAmount > 0) {
					pixelAmount--;
				}
			}
		}
	};

	const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
		const grid = objects.pixelGrid as PixelGrid;
		if (!grid) return;

		const dx = Math.abs(x1 - x0);
		const dy = Math.abs(y1 - y0);
		const sx = x0 < x1 ? 1 : -1;
		const sy = y0 < y1 ? 1 : -1;
		let err = dx - dy;

		let currentX = x0;
		let currentY = y0;

		while (true) {
			const halfGrid = grid.gridSize / 2;
			const isInBounds =
				currentX >= -halfGrid &&
				currentX < halfGrid &&
				currentY >= -halfGrid &&
				currentY < halfGrid;

			if (isInBounds) {
				const key = `${currentX},${currentY}`;
				const currentPixelData = grid.pixels[key];
				const isNewPixel = !currentPixelData;
				const needsColorUpdate = isNewPixel || currentPixelData?.color !== color;

				if (needsColorUpdate) {
					grid.addOrUpdatePixel(currentX, currentY, {
						color,
						lastedEditedUserID: null,
						lastedEditedName: null
					});
					if (isNewPixel && pixelAmount > 0) {
						pixelAmount--;
					}
				}
			}

			if (currentX === x1 && currentY === y1) break;

			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				currentX += sx;
			}
			if (e2 < dx) {
				err += dx;
				currentY += sy;
			}
		}
	};

	const onMouseDown = (e: MouseEvent) => {
		e.preventDefault();
		const rect = canvas.getBoundingClientRect();

		sctx.cursor.x = sctx.cursor.activeX = e.clientX;
		sctx.cursor.y = sctx.cursor.activeY = e.clientY;
		sctx.cursor.lastPoll = performance.now();
		sctx.cursor.active = true;

		const canvasRelX = e.clientX - rect.left;
		const canvasRelY = e.clientY - rect.top;

		const grid = objects.pixelGrid as PixelGrid;
		if (grid && sctx.s > 0) {
			const halfGrid = grid.gridSize / 2;
			const worldX = canvasRelX / sctx.s - halfGrid;
			const worldY = canvasRelY / sctx.s - halfGrid;

			const initialGridX = Math.floor(worldX / PIXEL_WORLD_SIZE);
			const initialGridY = Math.floor(worldY / PIXEL_WORLD_SIZE);

			sctx.cursor.gridX = Math.max(-halfGrid, Math.min(initialGridX, halfGrid - 1));
			sctx.cursor.gridY = Math.max(-halfGrid, Math.min(initialGridY, halfGrid - 1));
			sctx.cursor.prevGridX = sctx.cursor.gridX;
			sctx.cursor.prevGridY = sctx.cursor.gridY;
		}

		placePixel(canvasRelX, canvasRelY);
	};

	const onMouseMove = (e: MouseEvent) => {
		e.preventDefault();
		const now = performance.now();

		sctx.cursor.px = sctx.cursor.x;
		sctx.cursor.py = sctx.cursor.y;

		const rect = canvas.getBoundingClientRect();
		sctx.cursor.x = e.clientX;
		sctx.cursor.y = e.clientY;

		const canvasRelX = e.clientX - rect.left;
		const canvasRelY = e.clientY - rect.top;

		const grid = objects.pixelGrid as PixelGrid;
		let currentGridX = 0;
		let currentGridY = 0;
		if (grid && sctx.s > 0) {
			const halfGrid = grid.gridSize / 2;
			const worldX = canvasRelX / sctx.s - halfGrid;
			const worldY = canvasRelY / sctx.s - halfGrid;

			currentGridX = Math.floor(worldX / PIXEL_WORLD_SIZE);
			currentGridY = Math.floor(worldY / PIXEL_WORLD_SIZE);

			currentGridX = Math.max(-halfGrid, Math.min(currentGridX, halfGrid - 1));
			currentGridY = Math.max(-halfGrid, Math.min(currentGridY, halfGrid - 1));
		}

		sctx.cursor.gridX = currentGridX;
		sctx.cursor.gridY = currentGridY;

		if (sctx.cursor.active) {
			if (!grid) return;
			if (currentGridX !== sctx.cursor.prevGridX || currentGridY !== sctx.cursor.prevGridY) {
				drawLine(sctx.cursor.prevGridX, sctx.cursor.prevGridY, currentGridX, currentGridY);
				sctx.cursor.prevGridX = currentGridX;
				sctx.cursor.prevGridY = currentGridY;
			} else {
				placePixel(canvasRelX, canvasRelY);
			}
		}

		sctx.cursor.lastPoll = now;
	};

	const onMouseUp = (e: MouseEvent) => {
		if (sctx.cursor.active) {
			sctx.cursor.x = e.clientX;
			sctx.cursor.y = e.clientY;
			sctx.cursor.active = false;
		}
	};

	const startRoutines = () => {
		const updateLoop = () => {
			if (!rctx) return;
			render(rctx, sctx);
			requestAnimationFrame(updateLoop);
		};
		requestAnimationFrame(updateLoop);
	};

	const render = (rctx: CanvasRenderingContext2D, sctx: SceneContext) => {
		rctx.clearRect(0, 0, sctx.width, sctx.height);

		rctx.fillStyle = "white";
		rctx.fillRect(0, 0, sctx.width, sctx.height);

		rctx.imageSmoothingEnabled = false;

		const grid = objects.pixelGrid as PixelGrid;

		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].draw(rctx, sctx);
		}

		if (grid) {
			const pixelDrawSize = PIXEL_WORLD_SIZE * sctx.s;
			const halfGrid = grid.gridSize / 2;

			const cursorCanvasX = (sctx.cursor.gridX + halfGrid) * pixelDrawSize;
			const cursorCanvasY = (sctx.cursor.gridY + halfGrid) * pixelDrawSize;

			rctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
			rctx.lineWidth = 1;
			rctx.strokeRect(
				Math.floor(cursorCanvasX),
				Math.floor(cursorCanvasY),
				pixelDrawSize,
				pixelDrawSize
			);
		}
	};

	onMount(() => {
		adjustSizeAndScale();
		const err: Error | null = init();
		if (err) {
			loadErr = err;
			console.error("Canvas initialization failed:", err);
		}

		return () => {
			window.removeEventListener("resize", adjustSizeAndScale);
			if (canvas) {
				canvas.removeEventListener("mousemove", onMouseMove);
				canvas.removeEventListener("mousedown", onMouseDown);
			}
			window.removeEventListener("mouseup", onMouseUp);
		};
	});

	export const getPixelData = () => {
		const grid = objects.pixelGrid as PixelGrid;
		return grid ? grid.pixels : {};
	};
</script>

<section bind:this={canvasContainer} id="canvas-container" class="no-drag">
	<canvas bind:this={canvas} id="main-canvas" class="no-drag" />
	{#if loadErr}
		<p style="color: red; position: absolute; top: 10px; left: 10px;">
			Error: {loadErr.message}
		</p>
	{/if}
</section>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#canvas-container {
		aspect-ratio: 1 / 1;
		max-width: 600px;
		position: relative;
		margin: 20px auto;
		border: 1px solid #ccc;
		background: white;

		#main-canvas {
			touch-action: none;
			display: block;
			width: 100%;
			height: 100%;
			image-rendering: pixelated;
			image-rendering: crisp-edges;
		}
	}

	.no-drag {
		user-select: none;
		-webkit-user-drag: none;
	}
</style>
