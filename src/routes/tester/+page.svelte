<script lang="ts">
	import Palette from "../../lib/comp/canvas/Palette.svelte";
	import PixelCanvas from "../../lib/comp/canvas/PixelCanvas.svelte";

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

	let pixelAmount = 9999;
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

	<PixelCanvas color={selectedColor} bind:pixelAmount load={() => {}} />
	<p>Pixels left: {pixelAmount}</p>
</main>

<style lang="scss">
	main {
		width: 100%;
	}
</style>
