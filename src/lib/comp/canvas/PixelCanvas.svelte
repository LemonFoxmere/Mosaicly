<script lang="ts" context="module">
	let defaultSceneCtx = {
		x: 0, // canvas x
		y: 0, // canvas y
		absx: 0, // absolute screen space canvas x (center 0, 0)
		absy: 0, // absolute screen space canvas y (center 0, 0)
		s: 2, // scale
		ix: 0, // inertia X
		iy: 0, // inertia Y

		xBound: [-130, 130], // x bounds
		yBound: [-130, 130], // y bounds

		iE: 0.1, // inertia threshold (Episilon)
		iMax: 100, // inertia max
		zoomSensitivity: 0.003,

		width: 0,
		height: 0,
		frameBuf: 0,
		fpsPollRate: 500, // ms
		fps: 0,

		mode: "view" as "view" | "edit",

		cursor: {
			x: 0, // real x
			y: 0, // real y
			relx: 0, // relative x (offset)
			rely: 0, // relative y (offset)
			px: 0, // previous x
			py: 0, // previous y
			vx: 0, // velocity x
			vy: 0, // velocity y
			ve: 0.1, // velocity threshold
			activeX: 0, // x upon active (mousedown or last frame update). Used to calculate deltas
			activeY: 0, // y upon active (mousedown or last frame update). Used to calculate deltas
			active: false,
			rightActive: false, // if right click is active
			scrolling: false,
			lastPoll: 0 // last poll time
		},

		pixelGrid: {
			gridSize: 256, // size of the grid
			pixelWorldSize: 1, // how big a virtual pixel should be in real pixel-space units at zoom = 1
			brush: {
				size: 1, // size of the brush in pixels (const for now)
				color: "#000000", // color of the brush
				active: false // are we drawing?
			}
		}
	};
	type SceneContext = typeof defaultSceneCtx;

	export type { SceneContext }; // type usage
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { CanvasObject } from "./objects/CanvasObject";
	import { PixelGrid } from "./objects/PixelGrid";

	// external bindings
	let {
		color = "#000000",
		mode = "view" as "view" | "edit",
		load // dispatcher
	} = $props();

	let loadErr: string | null = null;
	let canvasContainer: HTMLElement;

	let canvas: HTMLCanvasElement;

	let rctx: CanvasRenderingContext2D | null; // rendering context
	let sctx: SceneContext = $state(defaultSceneCtx); // scene context (for canvas nav)

	// dynamically match canvas data from element props
	$effect(() => {
		if (sctx) {
			sctx.pixelGrid.brush.color = color; // set the brush color
			sctx.mode = mode; // set the mode
		}
	});

	let objects: Record<string, CanvasObject> = $state({});

	// initialization routine
	const init = (): Error | null => {
		let err: Error | null;

		err = initCanvas(); // initialize canvas
		if (err !== null) return err;
		err = initObjects(); // initialize objects
		// if (err !== null) return err;
		initListeners(); // start listeners
		startRoutines(); // start the game loop

		load(); // dispatch load event

		return null;
	};

	// inits window canvas and context
	const initCanvas = (): Error | null => {
		// set the canvas to the screen size
		canvas.width = sctx.width = canvasContainer.getBoundingClientRect().width;
		canvas.height = sctx.height = canvasContainer.getBoundingClientRect().height;

		// get rendering context
		rctx = canvas.getContext("2d");
		if (!rctx) return new Error("Cannot initialize canvas context"); // error

		rctx.imageSmoothingEnabled = false; // disable image smoothing

		return null;
	};

	const initObjects = (): Error | null => {
		const pixelGrid = new PixelGrid(
			0,
			0,
			sctx.pixelGrid.gridSize,
			sctx.pixelGrid.pixelWorldSize,
			sctx.s,
			"pixelGrid"
		);
		objects["pixelGrid"] = pixelGrid;
		return null;
	};

	// ====================================== LISTENERS =====================================

	// initializes event listeners to track mouse movement
	const initListeners = () => {
		window.addEventListener("mousedown", onMouseDown);
		canvasContainer.addEventListener("contextmenu", onMouseDown);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("resize", onWindowResize);

		canvasContainer.addEventListener(
			"wheel",
			(e: WheelEvent) => {
				e.preventDefault(); // makes trackpad work in non-safari browsers
				onMouseScroll(e);
			},
			{ passive: false }
		);
	};

	const onMouseDown = (e: MouseEvent) => {
		e.preventDefault();

		let canvasBCR = canvasContainer.getBoundingClientRect();

		// check if the mouse is inside the canvas first
		if (
			e.clientX < canvasBCR.left ||
			e.clientX > canvasBCR.right ||
			e.clientY < canvasBCR.top ||
			e.clientY > canvasBCR.bottom
		)
			return;

		// detect right click
		if (e.button === 2) {
			sctx.cursor.rightActive = true;
		} else {
			sctx.cursor.rightActive = false;
		}

		// update cursor position
		sctx.cursor.x = sctx.cursor.activeX = e.clientX;
		sctx.cursor.y = sctx.cursor.activeY = e.clientY;
		sctx.cursor.relx = sctx.cursor.x - canvasBCR.left;
		sctx.cursor.rely = sctx.cursor.y - canvasBCR.top;
		// reset velocity
		sctx.cursor.vx = 0;
		sctx.cursor.vy = 0;
		// reset inertia
		sctx.ix = 0;
		sctx.iy = 0;
		// reset last poll and set active
		sctx.cursor.lastPoll = performance.now();
		sctx.cursor.active = true;

		// loop over all objects and call the onMouseDown function
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onMouseDown(sctx, e);
		}
	};

	const onMouseMove = (e: MouseEvent) => {
		e.preventDefault();

		let canvasBCR = canvasContainer.getBoundingClientRect();

		// check if the mouse is inside the canvas first
		if (
			!sctx.cursor.active && // still need to track if the mouse is active
			(e.clientX < canvasBCR.left ||
				e.clientX > canvasBCR.right ||
				e.clientY < canvasBCR.top ||
				e.clientY > canvasBCR.bottom)
		)
			return;

		// performance shit
		sctx.cursor.lastPoll = performance.now();
		// set previous cursor position
		sctx.cursor.px = sctx.cursor.x;
		sctx.cursor.py = sctx.cursor.y;
		sctx.cursor.x = e.clientX;
		sctx.cursor.y = e.clientY;
		sctx.cursor.relx = sctx.cursor.x - canvasBCR.left;
		sctx.cursor.rely = sctx.cursor.y - canvasBCR.top;

		// trigger all objects onMouseMove
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onMouseMove(sctx, e);
		}
	};

	const onMouseUp = (e: MouseEvent) => {
		let canvasBCR = canvasContainer.getBoundingClientRect();

		// check if the mouse is inside the canvas first
		if (
			!sctx.cursor.active && // still need to track if the mouse is active
			(e.clientX < canvasBCR.left ||
				e.clientX > canvasBCR.right ||
				e.clientY < canvasBCR.top ||
				e.clientY > canvasBCR.bottom)
		)
			return;

		// stop drawing and set active to false
		sctx.cursor.x = sctx.cursor.activeX = e.clientX;
		sctx.cursor.y = sctx.cursor.activeY = e.clientY;
		sctx.cursor.relx = sctx.cursor.x - canvasBCR.left;
		sctx.cursor.rely = sctx.cursor.y - canvasBCR.top;
		// reset velocity (keep inertia for physics to do its work)
		sctx.cursor.vx = 0;
		sctx.cursor.vy = 0;
		sctx.ix = Math.max(-30, Math.min(30, sctx.ix));
		sctx.iy = Math.max(-30, Math.min(30, sctx.iy));
		// performance update
		sctx.cursor.lastPoll = performance.now();
		sctx.cursor.active = sctx.cursor.rightActive = false;

		// loop over all objects and call the onMouseUp function
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onMouseUp(sctx, e);
		}
	};

	let scrollingTimeout: ReturnType<typeof setTimeout>;
	const onMouseScroll = (e: WheelEvent) => {
		// clear the scrolling timeout
		clearTimeout(scrollingTimeout);

		sctx.cursor.scrolling = true;
		const originalSCursorX = sctx.cursor.relx - sctx.absx; // original screen cursor x
		const originalSCursorY = sctx.cursor.rely - sctx.absy;

		let cursorX = originalSCursorX / sctx.s; // calculate the world cursor x prior to scaling
		let cursorY = originalSCursorY / sctx.s;

		sctx.s -= e.deltaY * sctx.zoomSensitivity * sctx.s;
		// clamp between 0.5 and 3
		sctx.s = Math.max(Math.min(sctx.s, 50), 1);

		cursorX *= sctx.s; // calculate the new scaled position
		cursorY *= sctx.s;

		let dx = originalSCursorX - cursorX; // adjust the x and y to keep the cursor in the same position
		let dy = originalSCursorY - cursorY;

		updateCanvasXY(dx, dy); // update the canvas position

		// set scroll to false after 150ms
		scrollingTimeout = setTimeout(() => {
			sctx.cursor.scrolling = false;
		}, 150);
	};

	const onWindowResize = () => {
		if (canvas && canvasContainer) {
			canvas.width = sctx.width = canvasContainer.getBoundingClientRect().width;
			canvas.height = sctx.height = canvasContainer.getBoundingClientRect().height;
		}
	};

	const updateCanvasXY = (dx: number, dy: number) => {
		if ((sctx.x + dx) / sctx.s < sctx.xBound[0]) {
			sctx.x = sctx.xBound[0] * sctx.s;
		} else if ((sctx.x + dx) / sctx.s > sctx.xBound[1]) {
			sctx.x = sctx.xBound[1] * sctx.s;
		} else {
			sctx.x += dx;
		}

		if ((sctx.y + dy) / sctx.s < sctx.yBound[0]) {
			sctx.y = sctx.yBound[0] * sctx.s;
		} else if ((sctx.y + dy) / sctx.s > sctx.yBound[1]) {
			sctx.y = sctx.yBound[1] * sctx.s;
		} else {
			sctx.y += dy;
		}
	};

	// ===================================== ROUTINES =====================================

	const startRoutines = () => {
		if (!rctx) throw new Error("Canvas context not initialized"); // error

		// start render and update threads
		// (js isn't technically multithreaded, so we shouldnt run into big issues with race conditions)
		update();
		render(rctx, sctx);
	};

	// logic update function (called async to not block the render loop)
	const update = () => {
		// update the cursor velocity
		if (performance.now() - sctx.cursor.lastPoll !== 0) {
			sctx.cursor.vx =
				(sctx.cursor.x - sctx.cursor.px) / (performance.now() - sctx.cursor.lastPoll);
			sctx.cursor.vy =
				(sctx.cursor.y - sctx.cursor.py) / (performance.now() - sctx.cursor.lastPoll);
		}
		// cut off any velocity below the threshold
		sctx.cursor.vx = Math.abs(sctx.cursor.vx) > sctx.cursor.ve ? sctx.cursor.vx : 0;
		sctx.cursor.vy = Math.abs(sctx.cursor.vy) > sctx.cursor.ve ? sctx.cursor.vy : 0;

		// update the canvas position if dragged AND it's not in edit mode
		if ((sctx.cursor.active && sctx.mode !== "edit") || sctx.cursor.rightActive) {
			// when dragging, update inertia and canvas position
			let dx = sctx.cursor.x - sctx.cursor.activeX;
			let dy = sctx.cursor.y - sctx.cursor.activeY;
			updateCanvasXY(dx, dy); // update the canvas position

			sctx.cursor.activeX = sctx.cursor.x;
			sctx.cursor.activeY = sctx.cursor.y;

			sctx.ix = Math.max(Math.min(sctx.cursor.vx * 15, sctx.iMax), -sctx.iMax);
			sctx.iy = Math.max(Math.min(sctx.cursor.vy * 15, sctx.iMax), -sctx.iMax);
		} else {
			// apply friction to inertia when no drag
			updateCanvasXY(sctx.ix, sctx.iy); // update the canvas position
			sctx.ix *= Math.abs(sctx.ix) > sctx.iE ? 0.9 : 0;
			sctx.iy *= Math.abs(sctx.iy) > sctx.iE ? 0.9 : 0;
		}
		// round off all floating points to 3 decimal places
		sctx.x = Math.round(sctx.x * 1000) / 1000;
		sctx.y = Math.round(sctx.y * 1000) / 1000;
		sctx.absx = sctx.x + sctx.width / 2;
		sctx.absy = sctx.y + sctx.height / 2;
		sctx.ix = Math.round(sctx.ix * 1000) / 1000;
		sctx.iy = Math.round(sctx.iy * 1000) / 1000;
		sctx.s = Math.round(sctx.s * 1000) / 1000;

		// update all object logic
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].update(sctx);
		}

		// recursively call the update function
		requestAnimationFrame(update);
	};

	// render function (also called async)
	const render = async (rctx: CanvasRenderingContext2D, sctx: SceneContext) => {
		sctx.frameBuf++;

		// clear screen
		rctx.clearRect(0, 0, sctx.width, sctx.height);

		// draw all objects
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].render(rctx, sctx);
		}

		requestAnimationFrame(() => render(rctx, sctx));
	};

	// start routine to calculate fps
	setInterval(() => {
		sctx.fps = sctx.frameBuf / (sctx.fpsPollRate / 1000);
		sctx.frameBuf = 0;
	}, sctx.fpsPollRate);

	// init sequence
	onMount(() => {
		const err: Error | null = init();
		if (!err) {
			loadErr = err;
		}
	});
</script>

<section bind:this={canvasContainer} id="canvas-container" class="no-drag">
	<canvas bind:this={canvas} id="main-canvas" class="no-drag" />

	<pre id="debug">{JSON.stringify(
			sctx,
			(k, v) => {
				if (k === "frameBuf") return undefined;

				// round numbers
				if (k === "vx" || k === "vy") return Math.round(v * 1000) / 1000;
				if (k === "lastPoll") return Math.round(v);

				return v;
			},
			4
		)}</pre>
</section>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#canvas-container {
		width: 100%;
		height: 100%;
		position: relative;
		padding: 0;

		#main-canvas {
			position: absolute;
			top: 0;
			left: 0;

			touch-action: none;
			image-rendering: pixelated; // turn off aliasing
			border-radius: 8px;
			overflow: hidden;
			display: block;

			background: $text-primary; // constant bgc
		}

		#debug {
			position: absolute;
			top: 0px;
			left: calc(100% + 10px);
			z-index: 20;
			border-radius: 8px;

			padding: 20px;

			font-family: monospace;
			color: $background-accent;
			background-color: $text-primary;
			font-size: 16px;
			line-height: 100%;
		}
	}
</style>
