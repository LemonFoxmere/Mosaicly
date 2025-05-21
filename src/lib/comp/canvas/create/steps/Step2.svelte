<script lang="ts">
	import FormField from "$lib/comp/canvas/create/FormField.svelte";
	import MapboxMap from "$lib/comp/map/MapboxMap.svelte";
	import GeoLocate from "$lib/comp/ui/icons/GeoLocate.svelte";

	interface Props {
		canvasCoordinates: string;
		parsedLong: number;
		parsedLat: number;
		errorState: { flag: boolean; message: string };
		accuracy: number;
		isFocused: boolean;
		onLocate: () => void;
	}
	let {
		canvasCoordinates = $bindable(),
		parsedLong = $bindable(),
		parsedLat = $bindable(),
		errorState = $bindable(),
		isFocused = $bindable(false),
		onLocate
	}: Props = $props();

	let mapboxLatitude = $state(parsedLat);
	let mapboxLongitude = $state(parsedLong);

	$effect(() => {
		mapboxLatitude = parsedLat;
		mapboxLongitude = parsedLong;
	});

	$effect(() => {
		if (mapboxLatitude !== parsedLat) {
			parsedLat = mapboxLatitude;
		}
		if (mapboxLongitude !== parsedLong) {
			parsedLong = mapboxLongitude;
		}
	});
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
					onfocus={() => (isFocused = true)}
					onblur={() => (isFocused = false)}
				/>
				<button id="locate" class="none" onclick={onLocate}>
					<GeoLocate s={32} />
				</button>
			</div>
		</FormField>
	</div>

	<section id="map-wrapper">
		<p class="caption {!canvasCoordinates ? 'hidden' : ''}">
			Parsed as {parsedLat.toFixed(7)}, {parsedLong.toFixed(7)}
		</p>
		<div id="map">
			{#if typeof parsedLat === "number" && typeof parsedLong === "number" && parsedLat !== 0 && parsedLong !== 0}
				<MapboxMap
					bind:latitude={mapboxLatitude}
					bind:longitude={mapboxLongitude}
					allowClickToUpdateCoordinates={true}
				/>
			{:else}
				<h1>𓀐𓂸</h1>
			{/if}
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
				color: $text-secondary;
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
