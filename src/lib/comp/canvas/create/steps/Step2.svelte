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

	let canvasCoordinates = $state("");
	let latitude = $state(0);
	let longitude = $state(0);
	let accuracy = $state(0);
	let isFocused = $state(false);

	const DEFAULT_COORDS = { lat: 36.9940814, lng: -122.0612656 };

	if (!isDisplayableMapCoordinate(latitude, longitude) || (latitude === 0 && longitude === 0)) {
		latitude = DEFAULT_COORDS.lat;
		longitude = DEFAULT_COORDS.lng;
	}

	const MAP_CONFIG = {
		allowClickToUpdateCoordinates: true,
		showMarkerWhenDefault: false
	};

	let hasInputText = $derived(canvasCoordinates.trim() !== "");
	let isAtDefaultLocation = $derived(
		areCoordinatesEqual(latitude, longitude, DEFAULT_COORDS.lat, DEFAULT_COORDS.lng)
	);
	let isDisplayable = $derived(isDisplayableMapCoordinate(latitude, longitude));

	let showMapMarker = $derived(
		MAP_CONFIG.showMarkerWhenDefault || (!isAtDefaultLocation && isDisplayable)
	);

	let isValidOverall = $derived.by(() => {
		if (!hasInputText) return false;

		const parsed = parseCoordinateString(canvasCoordinates);
		if (!parsed.isValid) return false;

		const validation = validateCoordinates(latitude, longitude, {
			allowDefault: false,
			defaultCoords: DEFAULT_COORDS
		});

		return validation.isValid;
	});

	// notifying parent of data changes
	$effect(() => {
		if (onDataChange) {
			onDataChange({
				coordinates: { latitude, longitude, accuracy },
				isValid: isValidOverall
			});
		}
	});

	const handleLocateMeClick = async () => {
		const coords = await fetchCoordinatesForDisplay();
		if (coords.status !== 0 || !coords.location) {
			return;
		}

		latitude = coords.location.latitude;
		longitude = coords.location.longitude;
		accuracy = coords.location.accuracy;
	};

	const handleMapClick = (lat: number, lng: number) => {
		latitude = lat;
		longitude = lng;
	};

	$effect(() => {
		if (isFocused) {
			const parsed = parseCoordinateString(canvasCoordinates);
			if (parsed.isValid) {
				if (parsed.latitude !== latitude || parsed.longitude !== longitude) {
					latitude = parsed.latitude;
					longitude = parsed.longitude;
				}
			}
		}
	});

	$effect(() => {
		if (!isFocused) {
			const formattedCoords = formatCoordinateString(latitude, longitude);
			if (canvasCoordinates !== formattedCoords) {
				canvasCoordinates = formattedCoords;
			}
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
					{latitude}
					{longitude}
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
