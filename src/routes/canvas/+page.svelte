<script lang="ts">
	import Palette from "../../lib/comp/canvas/Palette.svelte";
	import PixelCanvas from "../../lib/comp/canvas/PixelCanvas.svelte";

	let selectedColor = $state("#000000");
	let editState: "view" | "edit" | "inspect" = $state("view");

	let editable = $state(true);

	const updateState = (newState: "view" | "edit" | "inspect") => {
		editState = newState;
		// TODO: do checking here
	};
</script>

<main>
	<section id="title-container" class="no-drag">
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
			disabled={!editable}
			on:click={() => updateState("edit")}
		>
			Edit
		</button>
		<button
			class={`${editState === "inspect" ? "solid" : "outline"}`}
			on:click={() => updateState("inspect")}
		>
			Inspect
		</button>
	</section>

	<section id="canvas-container">
		<Palette
			changeColor={(_color: string) => {
				selectedColor = _color;
			}}
		></Palette>

		<PixelCanvas
			color={selectedColor}
			mode={editState === "edit" ? "edit" : "view"}
			load={() => {}}
		/>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: calc(100% - 2px);

		display: flex;
		flex-direction: column;
		row-gap: 20px;
		padding: 10px 0px;

		// overflow: hidden;

		#title-container {
			width: 100%;
			display: flex;
			justify-content: space-between;
			column-gap: 20px;
			align-items: center;
			padding: 0px 20px;
		}

		#action-container {
			display: flex;
			column-gap: 10px;
			width: 100%;
			padding: 0px 20px;

			button {
				width: 100%;
			}
		}

		#canvas-container {
			display: flex;
			flex-direction: column;
			row-gap: 5px;
			padding: 0px 10px;
			flex-grow: 1;
		}
	}
</style>
