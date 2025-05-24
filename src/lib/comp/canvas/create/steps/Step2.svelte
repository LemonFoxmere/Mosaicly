<script lang="ts">
	import FormField from "$lib/comp/canvas/create/FormField.svelte";
	import MapboxMap from "$lib/comp/map/MapboxMap.svelte";
	import GeoLocate from "$lib/comp/ui/icons/GeoLocate.svelte";
	import {
		fetchCoordinatesForDisplay,
		parseCoordinateString,
		formatCoordinateString,
		isDisplayableMapCoordinate,
		areCoordinatesEqual,
		validateCoordinates
	} from "$lib/comp/canvas/utils/Geolocation";

	export interface Step2Data {
		coordinates: { latitude: number; longitude: number; accuracy: number };
		isValid: boolean;
	}

	interface Props {
		onDataChange?: (data: Step2Data) => void;
	}

	let { onDataChange }: Props = $props();

	const DEFAULT_COORDS = { lat: 36.9940814, lng: -122.0612656 };
	const MAP_CONFIG = {
		allowClickToUpdateCoordinates: true,
		showMarkerWhenDefault: false
	};

	let coords = $state({
		latitude: DEFAULT_COORDS.lat,
		longitude: DEFAULT_COORDS.lng,
		accuracy: 0
	});
	let canvasCoordinates = $state("");
	let isFocused = $state(false);

	let hasInputText = $derived(canvasCoordinates.trim() !== "");
	let isAtDefaultLocation = $derived(
		areCoordinatesEqual(
			coords.latitude,
			coords.longitude,
			DEFAULT_COORDS.lat,
			DEFAULT_COORDS.lng
		)
	);
	let isDisplayable = $derived(isDisplayableMapCoordinate(coords.latitude, coords.longitude));
	let showMapMarker = $derived(
		MAP_CONFIG.showMarkerWhenDefault || (!isAtDefaultLocation && isDisplayable)
	);

	let coordParseAndValidation = $derived.by(() => {
		const parsed = parseCoordinateString(canvasCoordinates);
		const valid =
			parsed.isValid &&
			validateCoordinates(parsed.latitude, parsed.longitude, {
				allowDefault: false,
				defaultCoords: DEFAULT_COORDS
			}).isValid;
		return { parsed, valid };
	});

	let isValidOverall = $derived(coordParseAndValidation.valid && hasInputText);

	$effect(() => {
		if (onDataChange) {
			onDataChange({
				coordinates: { ...coords },
				isValid: isValidOverall
			});
		}
	});

	$effect(() => {
		if (isFocused) {
			const { parsed } = coordParseAndValidation;
			if (
				parsed.isValid &&
				(parsed.latitude !== coords.latitude || parsed.longitude !== coords.longitude)
			) {
				coords = { ...coords, latitude: parsed.latitude, longitude: parsed.longitude };
			}
		} else {
			const formattedCoords = formatCoordinateString(coords.latitude, coords.longitude);
			if (canvasCoordinates !== formattedCoords) {
				canvasCoordinates = formattedCoords;
			}
		}
	});

	const handleLocateMeClick = async () => {
		const result = await fetchCoordinatesForDisplay();
		if (result.status !== 0 || !result.location) return;
		coords = {
			latitude: result.location.latitude,
			longitude: result.location.longitude,
			accuracy: result.location.accuracy
		};
	};

	const handleMapClick = (lat: number, lng: number) => {
		coords = { ...coords, latitude: lat, longitude: lng };
	};
</script>

<main>
	<div id="coordinate-input-wrapper">
		<FormField label="Canvas Coordinates">
			<div id="input-wrapper">
				<input
					type="text"
					bind:value={canvasCoordinates}
					placeholder="36.99979, 122.06337"
					class="coordinate-input"
					onfocus={() => (isFocused = true)}
					onblur={() => (isFocused = false)}
					class:invalid={!isValidOverall && hasInputText}
				/>
				<button id="locate" class="outline" onclick={handleLocateMeClick}>
					<GeoLocate s={32} />
				</button>
			</div>
			{#if !isValidOverall && hasInputText && !isAtDefaultLocation}
				<p class="error-message">
					Please enter valid coordinates or use the locate button.
				</p>
			{/if}
		</FormField>
	</div>

	<section id="map-wrapper">
		<p class="caption">
			{#if !showMapMarker}
				No marker yet? Click where you want it to show up.
			{:else}
				Click on the map to update the location, or use the locate button.
			{/if}
		</p>
		<div id="map">
			{#if isDisplayable}
				<MapboxMap
					latitude={coords.latitude}
					longitude={coords.longitude}
					allowClickToUpdateCoordinates={MAP_CONFIG.allowClickToUpdateCoordinates}
					showMarker={showMapMarker}
					onClickWithCoords={handleMapClick}
				/>
			{:else}
				<p id="bad-loc">
					The current coordinates are not displayable. Please enter valid coordinates or
					use the locate button.
				</p>
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

			#input-wrapper {
				position: relative;
				width: 100%;
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 10px;

				input {
					flex-grow: 1;
				}

				input.invalid {
					border-color: $accent-error;
					box-shadow: 0 0 0 1px $accent-error;
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
			.error-message {
				color: $accent-error;
				font-size: 14px;
				margin-top: 5px;
				width: 100%;
				text-align: left;
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
