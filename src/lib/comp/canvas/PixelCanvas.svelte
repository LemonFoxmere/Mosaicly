<script lang="ts" context="module">
	let defaultSceneCtx = {
		x: 0, // canvas x
		y: 0, // canvas y
		s: 2, // scale
		ix: 0, // inertia X
		iy: 0, // inertia Y

		iE: 0.1, // inertia threshold (Episilon)
		iMax: 100, // inertia max
		zoomSensitivity: 0.0015,

		width: 0,
		height: 0,
		frameBuf: 0,
		fpsPollRate: 500, // ms
		fps: 0,

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
	import { get } from "svelte/store";
	import { CanvasObject } from "./objects/CanvasObject";
	import { PixelGrid } from "./objects/PixelGrid";

	// external bindings
	let {
		color = "#000000",
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
		// TODO: add touch event
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mousedown", onMouseDown);
		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("resize", onWindowResize);

		// TODO: add later
		// canvasContainer.addEventListener(
		// 	"wheel",
		// 	(e: WheelEvent) => {
		// 		e.preventDefault(); // makes trackpad work in non-safari browsers
		// 		onMouseScroll(e);
		// 	},
		// 	{ passive: false }
		// );
	};

	const onMouseDown = (e: MouseEvent) => {
		e.preventDefault();

		let canvasBCR = canvasContainer.getBoundingClientRect();

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

		// performance shit
		sctx.cursor.lastPoll = performance.now();
		// set previous cursor position
		sctx.cursor.px = sctx.cursor.x;
		sctx.cursor.py = sctx.cursor.y;
		// upate current cursor position
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

		// stop drawing and set active to false
		sctx.cursor.x = sctx.cursor.activeX = e.clientX;
		sctx.cursor.y = sctx.cursor.activeY = e.clientY;
		sctx.cursor.relx = sctx.cursor.x - canvasBCR.left;
		sctx.cursor.rely = sctx.cursor.y - canvasBCR.top;
		// reset velocity (keep inertia for physics to do its work)
		sctx.cursor.vx = 0;
		sctx.cursor.vy = 0;
		sctx.ix = 0;
		sctx.iy = 0;
		// performance update
		sctx.cursor.lastPoll = performance.now();
		sctx.cursor.active = false;

		// loop over all objects and call the onMouseUp function
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onMouseUp(sctx, e);
		}
	};

	const onWindowResize = () => {
		if (canvas && canvasContainer) {
			canvas.width = sctx.width = canvasContainer.getBoundingClientRect().width;
			canvas.height = sctx.height = canvasContainer.getBoundingClientRect().height;
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
	const update = async () => {
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

		// update the canvas position if dragged
		if (sctx.cursor.active) {
			// when dragging, update inertia
			sctx.x = sctx.x + (sctx.cursor.x - sctx.cursor.activeX);
			sctx.y = sctx.y + (sctx.cursor.y - sctx.cursor.activeY);

			sctx.cursor.activeX = sctx.cursor.x;
			sctx.cursor.activeY = sctx.cursor.y;

			sctx.ix = Math.max(Math.min(sctx.cursor.vx * 15, sctx.iMax), -sctx.iMax);
			sctx.iy = Math.max(Math.min(sctx.cursor.vy * 15, sctx.iMax), -sctx.iMax);
		} else {
			// apply friction to inertia when no drag
			sctx.x += sctx.ix;
			sctx.y += sctx.iy;
			sctx.ix *= Math.abs(sctx.ix) > sctx.iE ? 0.9 : 0;
			sctx.iy *= Math.abs(sctx.iy) > sctx.iE ? 0.9 : 0;
		}
		// round off all floating points to 3 decimal places
		sctx.x = Math.round(sctx.x * 1000) / 1000;
		sctx.y = Math.round(sctx.y * 1000) / 1000;
		sctx.ix = Math.round(sctx.ix * 1000) / 1000;
		sctx.iy = Math.round(sctx.iy * 1000) / 1000;
		sctx.s = Math.round(sctx.s * 1000) / 1000;

		// update all object logic
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].update(sctx);
		}

		// recursively call the update function
		requestAnimationFrame(() => update());
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

				// display x and y properly
				if (k === "sTween") return get(v);

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
		height: calc(100% - 100px);
		position: relative;

		#main-canvas {
			touch-action: none;
			image-rendering: crisp-edges; // turn off aliasing
			border-radius: 8px;
			overflow: hidden;

			background: $text-primary; // constant bgc
		}

		#debug {
			position: absolute;
			top: -2px;
			left: calc(100% + 20px);
			z-index: 20;

			padding: 20px;

			font-family: monospace;
			color: $background-accent;
			background-color: $text-primary;
			font-size: 16px;
			line-height: 100%;
		}
	}
</style>
