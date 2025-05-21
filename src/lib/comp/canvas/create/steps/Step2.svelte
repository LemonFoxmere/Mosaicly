<script lang="ts">
	import FormField from "$lib/comp/canvas/create/FormField.svelte";
	import GeoLocate from "$lib/comp/ui/icons/GeoLocate.svelte";

	interface Props {
		canvasCoordinates: string;
		parsedLong: number;
		parsedLat: number;
		errorState: { flag: boolean; message: string };
		onLocate: () => void;
	}
	let {
		canvasCoordinates = $bindable(),
		parsedLong = $bindable(),
		parsedLat = $bindable(),
		errorState = $bindable(),
		onLocate
	}: Props = $props();
</script>

<main>
	<div id="coordinate-input-wrapper">
		<FormField label="Canvas Coordinates">
			<div id="input-wrapper">
				<input
					type="text"
					bind:value={canvasCoordinates}
					placeholder="36.99979, 122.06337"
					class="coordinate-input flex-fill"
				/>
				<button id="locate" class="none" on:click={onLocate}>
					<GeoLocate s={32} />
				</button>
			</div>
		</FormField>
	</div>

	<section id="map-wrapper">
		<p class="caption {!canvasCoordinates ? 'hidden' : ''}">
			Parsed as {parsedLat}, {parsedLong}
		</p>
		<div id="map">
			<!-- TODO: replace with the actual map in the future -->
			<!-- <h1>𓀐𓂸</h1> -->
		</div>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
	@use "$static/stylesheets/fonts";

	main {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		row-gap: 15px;

		#coordinate-input-wrapper {
			position: relative;

			width: 100%;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;

			#input-wrapper {
				position: relative;
				width: 100%;
				display: flex;
				justify-content: center;
				align-items: center;

				input {
					width: 100%;
					padding-right: 48px;
				}

				#locate {
					position: absolute;
					right: 12px;

					width: fit-content;
					height: fit-content;

					cursor: pointer;
				}
			}
		}

		#map-wrapper {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;

			.caption {
				color: $text-secondary; // override
			}

			#map {
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;

				border-radius: 8px;
				overflow: hidden;

				background-color: $background-secondary;

				h1 {
					font-size: 64px;
					color: $text-tertiary;
				}
			}
		}
	}
</style>
