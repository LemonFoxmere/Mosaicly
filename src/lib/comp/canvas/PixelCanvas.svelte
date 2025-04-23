<script lang="ts" context="module">
	let defaultSceneCtx = {
		x: 0, // canvas x
		y: 0, // canvas y
		s: 1, // scale
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
		}
	};
	type SceneContext = typeof defaultSceneCtx;

	export type { SceneContext }; // type usage
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	// external bindings
	let {
		color = "#000000",
		pixelAmount = $bindable(1),
		load // dispatcher
	} = $props();

	let loadErr: string | null = null;
	let canvasContainer: HTMLElement;
	let canvas: HTMLCanvasElement;
	let rctx: CanvasRenderingContext2D | null; // rendering context
	let sctx: SceneContext = $state(defaultSceneCtx); // scene context (for canvas nav)

	// initialization routine
	const init = (): Error | null => {
		let err: Error | null;

		err = initCanvas(); // initialize canvas
		if (err !== null) return err;
		// err = initObjects(); // initialize objects
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

		// temp: set the brush size to 1px
		rctx.lineWidth = 1;

		return null;
	};

	// ====================================== LISTENERS =====================================

	// initializes event listeners to track mouse movement
	const initListeners = () => {
		canvasContainer.addEventListener("mousemove", onMouseMove);
		canvasContainer.addEventListener("mousedown", onMouseDown);
		canvasContainer.addEventListener("mouseup", onMouseUp);
		canvasContainer.addEventListener("resize", onWindowResize);

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
		// update cursor position
		sctx.cursor.x = sctx.cursor.activeX = e.clientX;
		sctx.cursor.y = sctx.cursor.activeY = e.clientY;
		sctx.cursor.relx = e.offsetX;
		sctx.cursor.rely = e.offsetY;
		// reset velocity
		sctx.cursor.vx = 0;
		sctx.cursor.vy = 0;
		// reset inertia
		sctx.ix = 0;
		sctx.iy = 0;
		// reset last poll and set active
		sctx.cursor.lastPoll = performance.now();
		sctx.cursor.active = true;

		// start drawing
		if (pixelAmount > 0 && rctx) {
			rctx.beginPath();
			rctx.moveTo(sctx.cursor.relx, sctx.cursor.rely);
			rctx.lineTo(sctx.cursor.relx - 1, sctx.cursor.rely);
			rctx.closePath();
			rctx.stroke();

			pixelAmount--;
		}
	};

	const onMouseMove = (e: MouseEvent) => {
		// performance shit
		sctx.cursor.lastPoll = performance.now();
		// set previous cursor position
		sctx.cursor.px = sctx.cursor.x;
		sctx.cursor.py = sctx.cursor.y;
		// upate current cursor position
		sctx.cursor.x = e.clientX;
		sctx.cursor.y = e.clientY;
		sctx.cursor.relx = e.offsetX;
		sctx.cursor.rely = e.offsetY;

		// draw
		if (pixelAmount > 0 && rctx && sctx.cursor.active) {
			let offsetX = sctx.cursor.x - sctx.cursor.activeX;
			let offsetY = sctx.cursor.y - sctx.cursor.activeY;

			rctx.beginPath();
			rctx.moveTo(sctx.cursor.relx + offsetX, sctx.cursor.rely + offsetY);
			rctx.lineTo(sctx.cursor.relx, sctx.cursor.rely);
			rctx.closePath();
			rctx.stroke();

			// update the last position
			sctx.cursor.activeX = sctx.cursor.x;
			sctx.cursor.activeY = sctx.cursor.y;

			pixelAmount--;
		}
	};

	const onMouseUp = (e: MouseEvent) => {
		// stop drawing and set active to false
		sctx.cursor.x = sctx.cursor.activeX = e.clientX;
		sctx.cursor.y = sctx.cursor.activeY = e.clientY;
		sctx.cursor.relx = e.offsetX;
		sctx.cursor.rely = e.offsetY;
		// reset velocity (keep inertia for physics to do its work)
		sctx.cursor.vx = 0;
		sctx.cursor.vy = 0;
		sctx.ix = 0;
		sctx.iy = 0;
		// performance update
		sctx.cursor.lastPoll = performance.now();
		sctx.cursor.active = false;
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

		// update objects or whatever here
		if (rctx) {
			rctx.strokeStyle = color;
		}

		// recursively call the update function
		requestAnimationFrame(() => update());
	};

	// render function (also called async)
	const render = async (rctx: CanvasRenderingContext2D, sctx: SceneContext) => {
		sctx.frameBuf++;

		// clear screen
		// rctx.clearRect(0, 0, sctx.width, sctx.height);

		// draw all objects
		// for (let i = 0; i < Object.keys(objects).length; i++) {
		// 	objects[Object.keys(objects)[i]].draw(rctx, sctx);
		// }

		// draw a dummy cursor
		// rctx.fillStyle = "red";
		// rctx.beginPath();
		// rctx.arc(
		// 	sctx.cursor.wx + sctx.canvasWidth / 2,
		// 	sctx.cursor.wy + sctx.canvasHeight / 2,
		// 	5,
		// 	0,
		// 	2 * Math.PI
		// );
		// rctx.fill();

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
		height: 500px;
		position: relative;
		border: 2px solid $text-primary;

		#debug {
			position: absolute;
			top: 100%;
			left: -2px;
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
