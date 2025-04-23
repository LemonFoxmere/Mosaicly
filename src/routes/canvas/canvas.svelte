<!--
	Canvas element
	Controls drawing using color from palette
	Can exist without palette but would be drawing white pixels
-->

<script lang="ts">
	import { onMount } from "svelte";

	let { color = "#000000", pixelAmount = $bindable(1) } = $props(); // export stuff

	const background = "#ffffff";

	let canvas;
	let context;
	onMount(() => {
		canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");
		context.lineWidth = 1;
	});

	$effect(() => {
		context.strokeStyle = color;
	});

	let startPos = {};
	let isDrawing = false;
	const drawStart = ({ offsetX: x, offsetY: y }) => {
		startPos = { x, y };
		isDrawing = true;

		if (pixelAmount > 0) {
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(x - 1, y);
			context.closePath();
			context.stroke();

			pixelAmount--;
		}
	};

	const drawMove = ({ offsetX: _x, offsetY: _y }) => {
		if (!isDrawing) return;
		const { x, y } = startPos;
		if (pixelAmount > 0) {
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(_x, _y);
			context.closePath();
			context.stroke();

			pixelAmount--;
		}
		startPos = { x: _x, y: _y };
	};

	const drawEnd = () => {
		isDrawing = false;
	};
</script>

<section>
	<canvas
		id="canvas"
		width="256px"
		height="256px"
		style:background
		bind:this={canvas}
		onmousedown={drawStart}
		onmousemove={drawMove}
		onmouseup={drawEnd}
		onmouseleave={drawEnd}
	>
	</canvas>
</section>

<style lang="scss">
	canvas {
		margin: 15px;
		align-items: center;
		border: 5px solid black;
	}
</style>
