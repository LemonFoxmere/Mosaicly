<script lang="ts">
	import { ColorNames as CN, ColorDefs } from "./enums/ColorDefs";

	let { changeColor } = $props(); // event dispatcher for color change

	let activeColor: CN = $state(CN.BLACK);
	$effect(() => {
		changeColor(ColorDefs[activeColor].hex); // automatically update on change
	});

	// define R1 and R2 colors
	const row1: CN[] = [
		CN.RED,
		CN.ORANGE,
		CN.YELLOW,
		CN.LIME,
		CN.GREEN,
		CN.TEAL,
		CN.BLUE,
		CN.PURPLE,
		CN.PINK,
		CN.WHITE,
		CN.BLACK
	];
	const row2: CN[] = [
		CN.RED_LIGHT,
		CN.ORANGE_LIGHT,
		CN.YELLOW_LIGHT,
		CN.LIME_LIGHT,
		CN.GREEN_LIGHT,
		CN.TEAL_LIGHT,
		CN.BLUE_LIGHT,
		CN.PURPLE_LIGHT,
		CN.PINK_LIGHT,
		CN.GREY_LIGHT,
		CN.GREY_DARK
	];
</script>

<main>
	<section class="row" id="r1">
		{#each row1 as colorName}
			<div
				class={`swatch ${colorName === activeColor ? "active" : ""}`}
				onclick={() => {
					activeColor = colorName;
				}}
				style:background={ColorDefs[colorName].hex}
			></div>
		{/each}
	</section>
	<section class="row" id="r2">
		{#each row2 as colorName}
			<div
				class={`swatch ${colorName === activeColor ? "active" : ""}`}
				onclick={() => {
					activeColor = colorName;
				}}
				style:background={ColorDefs[colorName].hex}
			></div>
		{/each}
	</section>
</main>

<section>
	<div>
		<p id="SelectedColor" class="square" style="margin-left: 20px;"></p>
	</div>
</section>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: 65px;
		display: flex;
		flex-direction: column;

		border-radius: 8px;

		.row {
			display: flex;
			width: 100%;
			height: 100%;
			flex-grow: 1;
			flex-wrap: nowrap;

			.swatch {
				padding: 0;
				width: 100%;
				height: 100%;
				z-index: 1;
				border-radius: 0px;

				cursor: pointer;

				&.active {
					transform: scale(1.25);
					border-radius: 4px;
					box-shadow: 4px 4px 10px hsla(22, 80%, 12%, 0.3);
					z-index: 3;
				}

				transition-property:
					transform box-shadow,
					border-radius;
				transition-duration: 300ms;
				transition-timing-function: $out-generic-expo;
			}

			&#r1 {
				// select the first and last element
				.swatch:first-child {
					border-top-left-radius: 8px;
				}
				.swatch:last-child {
					border-top-right-radius: 8px;
				}
			}
			&#r2 {
				// select the first and last element
				.swatch:first-child {
					border-bottom-left-radius: 8px;
				}
				.swatch:last-child {
					border-bottom-right-radius: 8px;
				}
			}
		}
	}
</style>
