<script lang="ts">
	import Canvas from "./canvas.svelte";
	import Palette from "./palette.svelte";

	const colors = [
		"#ffffff",
		"#000000",
		"#ff0000",
		"#ffaa00",
		"#ffff00",
		"#0fff00",
		"#00ffff",
		"#000fff",
		"#8000ff",
		"#f300ff"
	];
	let selectedColor = colors[0];

	let _pixelAmount = 20;
</script>

<main>
	<a href="./"> <button>Back</button> </a>
	<h1>Canvas</h1>
	<Palette
		{colors}
		ChangeColor={(_color: string) => {
			selectedColor = _color;
		}}
	></Palette>
	<Canvas color={selectedColor} bind:pixelAmount={_pixelAmount}></Canvas>
	<p>Pixels left: {_pixelAmount}</p>
</main>

<style lang="scss">
</style>
