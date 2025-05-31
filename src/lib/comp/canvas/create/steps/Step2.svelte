<script lang="ts">
	import FormField from "$lib/comp/canvas/create/FormField.svelte";
	import MapboxMap from "$lib/comp/map/MapboxMap.svelte";
	import GeoLocate from "$lib/comp/ui/icons/GeoLocate.svelte";
	import { isDisplayableMapCoordinate } from "$lib/comp/canvas/utils/Geolocation";

	interface Props {
		canvasCoordinates: string;
		parsedLong: number;
		parsedLat: number;
		errorState: { flag: boolean; message: string };
		accuracy: number;
		isFocused: boolean;
		zoom?: number;
		forceZoomChange?: any;
		onLocate: () => void;
		showMapMarker: boolean;
		onMapClickWithCoords?: (lat: number, lng: number) => void;
	}
	let {
		canvasCoordinates = $bindable(),
		parsedLong = $bindable(),
		parsedLat = $bindable(),
		errorState = $bindable(),
		isFocused = $bindable(false),
		zoom = 18,
		forceZoomChange = undefined,
		onLocate,
		showMapMarker = $bindable(),
		onMapClickWithCoords = undefined
	}: Props = $props();

	let mapboxLatitude = $state(parsedLat);
	let mapboxLongitude = $state(parsedLong);
	let mapboxZoom = $state(zoom);
	let mapboxForceZoomChange = $state(forceZoomChange);

	$effect(() => {
		mapboxLatitude = parsedLat;
		mapboxLongitude = parsedLong;
		mapboxZoom = zoom;
		mapboxForceZoomChange = forceZoomChange;
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
				<button id="locate" class="outline" onclick={onLocate}>
					<GeoLocate s={32} />
				</button>
			</div>
		</FormField>
	</div>

	<section id="map-wrapper">
		<p class="caption">No marker yet? Click where you want it to show up.</p>
		<div id="map">
			{#if isDisplayableMapCoordinate(parsedLat, parsedLong)}
				<MapboxMap
					bind:latitude={mapboxLatitude}
					bind:longitude={mapboxLongitude}
					zoom={mapboxZoom}
					forceZoomChange={mapboxForceZoomChange}
					allowClickToUpdateCoordinates={true}
					showMarker={showMapMarker}
					onClickWithCoords={onMapClickWithCoords}
				/>
			{:else}
				<p id="bad-loc">That coordinate is so bad it doesn't even exist. Please fix it.</p>
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
				flex-direction: row;
				align-items: center;
				gap: 10px;

				input {
					flex-grow: 1;
					width: 100%;
				}

				#locate {
					width: 60px;
					height: 60px;
					padding: 14px;

					&:active {
						margin-top: 0;
					}
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

				#bad-loc {
					width: 100%;
					padding: 0px 30px;
					white-space: wrap;
					text-align: center;
				}
			}
		}
	}
</style>
