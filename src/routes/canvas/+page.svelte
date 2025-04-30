<script lang="ts">
	import Palette from "../../lib/comp/canvas/Palette.svelte";
	import PixelCanvas from "../../lib/comp/canvas/PixelCanvas.svelte";

	let selectedColor = $state("#000000");
	let editState: "view" | "edit" | "inspect" = $state("view");

	const updateState = (newState: "view" | "edit" | "inspect") => {
		editState = newState;
		// TODO: do checking here
	};
</script>

<main>
	<section id="title-container">
		<h2>Frog</h2>
		<p>On the pole near the entrance of the Cowell dining hall.</p>
	</section>

	<section id="action-container">
		<button
			class={`${editState === "view" ? "solid" : "outline"}`}
			on:click={() => updateState("view")}
		>
			View
		</button>
		<button
			class={`${editState === "edit" ? "solid" : "outline"}`}
			on:click={() => updateState("edit")}
		>
			Edit
		</button>
		<button
			class={`${editState === "inspect" ? "solid" : "outline"}`}
			on:click={() => updateState("inspect")}
		>
			Inspect</button
		>
	</section>

	<section id="canvas-container">
		<Palette
			changeColor={(_color: string) => {
				selectedColor = _color;
			}}
		></Palette>

		<PixelCanvas color={selectedColor} load={() => {}} />
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: calc(100% - 10px);
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

		#action-container {
			display: flex;
			column-gap: 10px;
			width: 100%;

			button {
				width: 100%;
			}
		}

		#canvas-container {
			display: flex;
			flex-direction: column;
			row-gap: 10px;
			flex-grow: 1;
		}
	}
</style>
