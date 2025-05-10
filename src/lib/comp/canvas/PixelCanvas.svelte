<script lang="ts" context="module">
	let defaultSceneCtx = {
		x: 0, // canvas x
		y: 0, // canvas y
		absx: 0, // absolute screen space canvas x (center 0, 0)
		absy: 0, // absolute screen space canvas y (center 0, 0)
		s: 1.25, // scale
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
		debugMode: false, // turn debugger off

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
			secondaryActive: false, // if right click / double finger is active
			scrolling: false,
			lastPoll: 0, // last poll time
			touch: {
				usingTouch: false, // if the current input is using touch or not
				touchPtCt: 0, // touch point count. I.e., how many touch points there are
				previousZoomDist: 0,
				initX: 0, // initial average x (unchanged. Used to calculate threshold)
				initY: 0 // initial average y (unchanged. Used to calculate threshold)
			}
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
	import { onDestroy, onMount } from "svelte";
	import { CanvasObject } from "./objects/CanvasObject";
	import { PixelGrid } from "./objects/PixelGrid";
	import { CanvasUtils } from "./utils/CanvasUtils";
	import { CursorUtils } from "./utils/CursorUtils";
	import { createClient, RealtimeChannel } from '@supabase/supabase-js'
	import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";

	// external bindings
	let {
		color = "#000000",
		mode = "view" as "view" | "edit",
		load // dispatcher
	} = $props();

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	const channelName = 'qwer-tyui-opas'; // TODO: will change dynamically
	let canvasChannel: RealtimeChannel | null = $state(null);
	let isDirtyCanvas: Boolean = $state(false);

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

	let objects: Record<string, PixelGrid> = $state({}); // TODO: generalize this to CanvasObject

	// initialization routine
	const init = (): Error | null => {
		let err: Error | null;

		err = initCanvas(); // initialize canvas
		if (err !== null) return err;
		err = initObjects(); // initialize objects
		// if (err !== null) return err;
		initCanvasChannel();
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

	// inits canvas channel
	const initCanvasChannel = (): Error | null => {
		canvasChannel = supabase.channel(channelName);
		canvasChannel.on(
			'broadcast', 
			{ event: 'sync' },

			(payload) => {
				// console.log(payload.payload.pixels.pixels);
				// console.log(objects["pixelGrid"].pixels.id);

				Object.assign(objects["pixelGrid"].pixels, payload.payload.pixels.pixels);
				// console.log(objects["pixelGrid"]);
			}
		)
		.subscribe((status) => console.log(status));

		return null;
	}

	// ====================================== LISTENERS =====================================

	// initializes event listeners to track mouse movement
	const initListeners = () => {
		// cursor events
		window.addEventListener("mousedown", onMouseDown);
		canvasContainer.addEventListener("contextmenu", onMouseDown);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("resize", onWindowResize);

		// touch events
		canvasContainer.addEventListener("touchstart", onTouchStart);
		canvasContainer.addEventListener("touchmove", onTouchMove);
		canvasContainer.addEventListener("touchend", onTouchEnd);

		canvasContainer.addEventListener(
			"wheel",
			(e: WheelEvent) => {
				e.preventDefault(); // makes trackpad work in non-safari browsers
				onMouseScroll(e);
			},
			{ passive: false }
		);
	};

	const cleanUpListeners = () => {
		// cursor events
		window.removeEventListener("mousedown", onMouseDown);
		canvasContainer.removeEventListener("contextmenu", onMouseDown);
		window.removeEventListener("mousemove", onMouseMove);
		window.removeEventListener("mouseup", onMouseUp);
		window.removeEventListener("resize", onWindowResize);

		// touch events
		canvasContainer.removeEventListener("touchstart", onTouchStart);
		canvasContainer.removeEventListener("touchmove", onTouchMove);
		canvasContainer.removeEventListener("touchend", onTouchEnd);

		canvasContainer.removeEventListener("wheel", onMouseScroll);
	};

	// touch events

	const onTouchStart = (e: TouchEvent) => {
		if (!e.isTrusted) return; // ignore fake events

		// set secondary active based on the number of touches
		sctx.cursor.touch.touchPtCt = e.touches.length;
		sctx.cursor.secondaryActive = e.touches.length === 2; // double finger = ignore draw mode

		// average all touch points & check bound
		const canvasBCR = canvasContainer.getBoundingClientRect();
		let [avgX, avgY, numInBound] = CursorUtils.getAvgTouchPoint(e.touches);
		if (numInBound === 0) return; // no touch points in bound. Do nothing

		e.preventDefault();

		// check if within bound
		if (CursorUtils.isWithinBound(avgX, avgY, canvasBCR)) return;

		// capture cursor positions
		CursorUtils.captureCursor(sctx, avgX, avgY, canvasBCR);
		sctx.cursor.active = sctx.cursor.touch.usingTouch = true;

		// if there's two fingers, calculate the initial distance between the two
		if (e.touches.length === 2) {
			sctx.cursor.touch.previousZoomDist = CursorUtils.getDist(
				e.touches[0].clientX,
				e.touches[0].clientY,
				e.touches[1].clientX,
				e.touches[1].clientY
			);
		}
		sctx.cursor.touch.initX = avgX;
		sctx.cursor.touch.initY = avgY;

		// loop over all objects and call the onMouseDown function
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onCursorDown(sctx);
		}
	};

	const onTouchMove = (e: TouchEvent) => {
		if (!e.isTrusted) return; // ignore fake events

		// average all touch points & check bound
		sctx.cursor.touch.touchPtCt = e.touches.length;
		const canvasBCR = canvasContainer.getBoundingClientRect();
		let [avgX, avgY, numInBound] = CursorUtils.getAvgTouchPoint(e.touches);
		if (!sctx.cursor.active && numInBound === 0) return; // no touch points in bound. Do nothing

		e.preventDefault();

		// performance shit
		sctx.cursor.lastPoll = performance.now();
		// set previous cursor position
		CursorUtils.stepCursor(sctx, avgX, avgY, canvasBCR);

		// calculate zoom if there's two fingers
		if (e.touches.length === 2) {
			// calculate new dist
			const newDist = CursorUtils.getDist(
				e.touches[0].clientX,
				e.touches[0].clientY,
				e.touches[1].clientX,
				e.touches[1].clientY
			);
			// calculate canvas offset (more natural zooming)
			const originalSCursorX = sctx.cursor.relx - sctx.absx; // original screen cursor x
			const originalSCursorY = sctx.cursor.rely - sctx.absy;
			let cursorX = originalSCursorX / sctx.s; // calculate the world cursor x prior to scaling
			let cursorY = originalSCursorY / sctx.s;

			// scale inverse the previous dist and use it to calculate the new scale
			const origDist = sctx.cursor.touch.previousZoomDist / sctx.s;
			const ds = newDist / origDist - sctx.s; // difference in scale

			sctx.s += ds * 1; // scale
			// clamp between 1 and 50
			sctx.s = Math.max(Math.min(sctx.s, 50), 1);

			// update the previous dist
			sctx.cursor.touch.previousZoomDist = newDist;

			// update the canvas offset
			cursorX *= sctx.s; // calculate the new scaled position
			cursorY *= sctx.s;

			let dx = originalSCursorX - cursorX; // adjust the x and y to keep the cursor in the same position
			let dy = originalSCursorY - cursorY;

			CanvasUtils.updateCanvasXY(sctx, dx, dy); // update the canvas position
		}

		// trigger all objects onMouseMove
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onCursorMove(sctx);
		}
	};

	const onTouchEnd = (e: TouchEvent) => {
		if (!e.isTrusted) return; // ignore fake events

		// average all touch points & check bound
		const canvasBCR = canvasContainer.getBoundingClientRect();
		let [avgX, avgY, numInBound] = CursorUtils.getAvgTouchPoint(e.touches);
		if (!sctx.cursor.active && numInBound === 0) return; // no touch points in bound. Do nothing

		e.preventDefault();

		// loop over all objects and call the onMouseUp function
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onCursorUp(sctx);
		}

		// release and reset cursor
		CursorUtils.releaseCursor(sctx, avgX, avgY, canvasBCR);
		// performance update
		sctx.cursor.lastPoll = performance.now();
		sctx.cursor.active = sctx.cursor.secondaryActive = false;
	};

	// mouse events

	const onMouseDown = (e: MouseEvent) => {
		e.preventDefault();

		// check if the mouse is inside the canvas first
		const canvasBCR = canvasContainer.getBoundingClientRect();
		if (CursorUtils.isWithinBound(e.clientX, e.clientY, canvasBCR)) return;

		// detect right click
		sctx.cursor.secondaryActive = e.button === 2;

		// initialize cursor positions & physics params
		CursorUtils.captureCursor(sctx, e.clientX, e.clientY, canvasBCR);
		// reset last poll and set active
		sctx.cursor.lastPoll = performance.now();
		sctx.cursor.active = true;
		sctx.cursor.touch.usingTouch = false;

		// loop over all objects and call the onMouseDown function
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onCursorDown(sctx);
		}
	};

	const onMouseMove = (e: MouseEvent) => {
		e.preventDefault();

		// check if the mouse is inside the canvas or active first
		const canvasBCR = canvasContainer.getBoundingClientRect();
		if (!sctx.cursor.active && CursorUtils.isWithinBound(e.clientX, e.clientY, canvasBCR))
			return;

		// performance shit
		sctx.cursor.lastPoll = performance.now();
		// set previous cursor position
		CursorUtils.stepCursor(sctx, e.clientX, e.clientY, canvasBCR);

		// trigger all objects onMouseMove
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onCursorMove(sctx);
		}
	};

	const onMouseUp = (e: MouseEvent) => {
		// check if the mouse is inside the canvas or active first
		const canvasBCR = canvasContainer.getBoundingClientRect();
		if (!sctx.cursor.active && CursorUtils.isWithinBound(e.clientX, e.clientY, canvasBCR))
			return;

		// loop over all objects and call the onMouseUp function
		for (let i = 0; i < Object.keys(objects).length; i++) {
			objects[Object.keys(objects)[i]].onCursorUp(sctx);
		}

		// release and reset cursor states
		CursorUtils.releaseCursor(sctx, e.clientX, e.clientY, canvasBCR);
		// performance update
		sctx.cursor.lastPoll = performance.now();
		sctx.cursor.active = sctx.cursor.secondaryActive = false;

		canvasChannel?.send({
			type: 'broadcast',
			event: 'sync',
			payload: { 
				pixels: objects["pixelGrid"],
				channelName: channelName
			}
		})
		.then((resp) => console.log(resp))
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
		// clamp between 1 and 50
		sctx.s = Math.max(Math.min(sctx.s, 50), 1);

		cursorX *= sctx.s; // calculate the new scaled position
		cursorY *= sctx.s;

		let dx = originalSCursorX - cursorX; // adjust the x and y to keep the cursor in the same position
		let dy = originalSCursorY - cursorY;

		CanvasUtils.updateCanvasXY(sctx, dx, dy); // update the canvas position

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
		if ((sctx.cursor.active && sctx.mode !== "edit") || sctx.cursor.secondaryActive) {
			// when dragging, update inertia and canvas position
			let dx = sctx.cursor.x - sctx.cursor.activeX;
			let dy = sctx.cursor.y - sctx.cursor.activeY;
			CanvasUtils.updateCanvasXY(sctx, dx, dy); // update the canvas position

			sctx.cursor.activeX = sctx.cursor.x;
			sctx.cursor.activeY = sctx.cursor.y;

			// calculate inertia
			const intertialScaler = sctx.cursor.touch.usingTouch ? 1 : 10; // regular for touch, higher for cursors
			sctx.ix = Math.max(Math.min(sctx.cursor.vx * intertialScaler, sctx.iMax), -sctx.iMax);
			sctx.iy = Math.max(Math.min(sctx.cursor.vy * intertialScaler, sctx.iMax), -sctx.iMax);
		} else {
			// apply friction to inertia when no drag
			CanvasUtils.updateCanvasXY(sctx, sctx.ix, sctx.iy); // update the canvas position
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
	onDestroy(() => {
		cleanUpListeners();
	});
</script>

<section bind:this={canvasContainer} id="canvas-container" class="no-drag">
	<canvas bind:this={canvas} id="main-canvas" class="no-drag" />

	{#if sctx.debugMode}
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
	{/if}
</section>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#canvas-container {
		width: 100%;
		flex-grow: 1;
		position: relative;
		padding: 0;

		@media screen and (min-width: $mobile-width) {
			height: auto;
			aspect-ratio: 1/1;
		}

		#main-canvas {
			position: absolute;
			top: 0;
			left: 0;

			touch-action: none;
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
