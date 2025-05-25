<script lang="ts">
	import CanvasCard from "../CanvasCard.svelte";
	import EditCanvasModal from "../EditCanvasModal.svelte";

	let { user = $bindable<DB.AppUser>(), canvases = $bindable<DB.Canvas[]>() } = $props();

	// canvas modal states
	let isOpen = $state(false);
	let focusedCanvas = $state<DB.Canvas>();
	let isSaving = $state(false);

	const editThisCanvas = (canvas: DB.Canvas) => {
		focusedCanvas = canvas;
		isOpen = true;
	};
</script>

<main>
	<!-- canvases list render -->
	<div class="canvas_list">
		{#each canvases as canvas (canvas.id)}
			<CanvasCard {canvas} onEdit={editThisCanvas} />
		{/each}
	</div>

	<EditCanvasModal bind:open={isOpen} bind:isSaving canvas={focusedCanvas} />

	<!-- add new canvas, popup like modal -->
	<a id="new-canvas" href="/create">
		<button> New Canvas </button>
	</a>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		justify-content: flex-start;

		#new-canvas {
			position: sticky;
			bottom: 0px;

			width: 100%;
			padding: 20px 0px;

			text-decoration: none;
			background: linear-gradient(transparent, $background-primary);

			button {
				width: 100%;
			}
		}
	}
</style>
