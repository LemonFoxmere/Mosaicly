<script lang="ts">
	import Palette from "$lib/comp/canvas/Palette.svelte";
	import PixelCanvas from "$lib/comp/canvas/PixelCanvas.svelte";
	import { onMount } from "svelte";

	let selectedColor = "#000000";
	let pixelAmount = 65536;

	let canvasSection: HTMLDivElement;
	let paletteWrapper: HTMLDivElement;
	let canvasContainer: HTMLElement | null = null; // To store the canvas container element

	onMount(() => {
		// Find the canvas container once mounted
		canvasContainer = canvasSection?.querySelector("#canvas-container") as HTMLElement;
		if (!canvasContainer || !paletteWrapper) return;

		const paletteElement = paletteWrapper.firstElementChild as HTMLElement;
		if (!paletteElement) return;

		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const canvasWidth = entry.contentRect.width;
				const naturalPaletteWidth = paletteElement.offsetWidth;

				if (naturalPaletteWidth > 0 && canvasWidth > 0) {
					// Using contentRect.width should be more reliable
					// Keep the small adjustment factor if needed for precise alignment
					const scale = canvasWidth / naturalPaletteWidth;
					paletteWrapper.style.transform = `scale(${scale})`;
				} else {
					// Reset scale if elements aren't ready
					paletteWrapper.style.transform = "scale(1)";
				}
			}
		});

		// Observe the canvas container for size changes
		observer.observe(canvasContainer);

		// Initial scale check in case ResizeObserver fires slightly late
		const initialCanvasWidth = canvasContainer.offsetWidth;
		const initialNaturalPaletteWidth = paletteElement.offsetWidth;
		if (initialNaturalPaletteWidth > 0 && initialCanvasWidth > 0) {
			const initialScale = initialCanvasWidth / initialNaturalPaletteWidth;
			paletteWrapper.style.transform = `scale(${initialScale})`;
		}

		return () => {
			// Stop observing when the component is destroyed
			observer.disconnect();
		};
	});
</script>

<main>
	<section id="content">
		<h1>Canvas Test</h1>

		<div class="info">
			<p>Pixels left: {pixelAmount}</p>
		</div>

		<div class="canvas-section" bind:this={canvasSection}>
			<div class="palette-wrapper" bind:this={paletteWrapper}>
				<Palette
					ChangeColor={(_color: string) => {
						selectedColor = _color;
					}}
				/>
			</div>

			<PixelCanvas color={selectedColor} bind:pixelAmount />
		</div>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: fit-content;
		padding: 10px 30px 20px 30px;

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		row-gap: 20px;

		#content {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 20px;
			align-items: center;

			.info {
				width: 100%;
				text-align: center;
				margin-bottom: 5px;
			}

			h1 {
				margin-bottom: 5px;
			}

			.canvas-section {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 100%;
				max-width: 600px;
			}

			.palette-wrapper {
				margin-bottom: 10px;
				transform-origin: center top;
				display: flex;
				justify-content: center;
			}
		}
	}
</style>
