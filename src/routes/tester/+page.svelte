<script lang="ts">
	import DivCanvas from "$lib/comp/canvas/DivCanvas.svelte";
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
	<section id="title-container">
		<a href="./"> <button>Back</button> </a>
		<h1>Canvas</h1>
	</section>

	<section>
		<p>Pixels left: {pixelAmount}</p>
		<Palette
			{colors}
			ChangeColor={(_color: string) => {
				selectedColor = _color;
			}}
		></Palette>
		<PixelCanvas color={selectedColor} --height="300" bind:pixelAmount load={() => {}} />
	</section>
</main>

<style lang="scss">
	main {
		width: 100%;
		padding: 10px 30px;

		display: flex;
		flex-direction: column;
		row-gap: 20px;

		#title-container {
			width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>
