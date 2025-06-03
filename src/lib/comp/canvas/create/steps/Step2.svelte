<script lang="ts">
	import {
		fetchCoordinatesForDisplay,
		formatCoordinateString,
		isDisplayableMapCoordinate,
		parseCoordinateString,
		validateCoordinates
	} from "$lib/comp/canvas/utils/Geolocation";
	import MapboxMap from "$lib/comp/map/MapboxMap.svelte";
	import GeoLocate from "$lib/comp/ui/icons/GeoLocate.svelte";

	export interface Step2Data {
		coordinates: { latitude: number; longitude: number; accuracy: number };
		valid: boolean;
	}

	interface Props {
		onDataChange?: (data: Step2Data) => void;
		valid: boolean;
	}

	let { onDataChange, valid: bindableValidity = $bindable<boolean>(false) }: Props = $props();

	// map configs & coordinate states
	// const DEFAULT_COORDS = { lat: 36.9940814, lng: -122.0612656 }; // the default coords
	const DEFAULT_COORDS = { lat: NaN, lng: NaN }; // the default coords
	const MAP_CONFIG = {
		// map cfg
		allowClickToUpdateCoordinates: true,
		showMarkerWhenDefault: false
	};
	let coords = $state({
		// current coordinate obj
		latitude: DEFAULT_COORDS.lat,
		longitude: DEFAULT_COORDS.lng,
		accuracy: 0
	});
	let isAtDefaultLocation = $derived(
		// flag for detecting default position
		isNaN(coords.latitude) || isNaN(coords.longitude)
	);
	let isDisplayable = $derived(isDisplayableMapCoordinate(coords.latitude, coords.longitude)); // sanity check
	let showMapMarker = $derived(
		MAP_CONFIG.showMarkerWhenDefault || (!isAtDefaultLocation && isDisplayable)
	);
	let canvasCoordinateStr = $state(""); // raw input
	let coordParseAndValidation = $derived.by(() => {
		// parsed coordinate obj from raw string
		const parsed = parseCoordinateString(canvasCoordinateStr);
		const valid =
			parsed.isValid &&
			validateCoordinates(parsed.latitude, parsed.longitude, {
				allowDefault: false,
				defaultCoords: DEFAULT_COORDS
			}).isValid;
		return { parsed, valid };
	});

	// input configs & states
	let isInputFocused = $state(false);
	let hasInputText = $derived(canvasCoordinateStr.trim() !== "");
	let isValidOverall = $derived(
		coordParseAndValidation.valid && hasInputText && !isAtDefaultLocation
	);

	$effect(() => {
		// broadcast dispatch signal on data change
		if (onDataChange) {
			onDataChange({
				coordinates: { ...coords },
				valid: isValidOverall
			});
			bindableValidity = isValidOverall; // update the valid prop
		}
	});

	$effect(() => {
		if (isInputFocused) {
			const { parsed } = coordParseAndValidation;
			if (
				parsed.isValid &&
				(parsed.latitude !== coords.latitude || parsed.longitude !== coords.longitude)
			) {
				coords = { ...coords, latitude: parsed.latitude, longitude: parsed.longitude };
			}
		} else {
			const formattedCoords = formatCoordinateString(coords.latitude, coords.longitude);
			if (canvasCoordinateStr !== formattedCoords) {
				canvasCoordinateStr = formattedCoords;
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
		<label class:invalid={isValidOverall || isAtDefaultLocation}>
			<p class="caption">
				{#if isValidOverall || isAtDefaultLocation}
					<!-- cancel out the effect by default location -->
					Canvas Coordinates
				{:else}
					Please enter valid coordinates or use the locate button.
				{/if}
			</p>

			<div id="input-wrapper">
				<input
					type="text"
					bind:value={canvasCoordinateStr}
					placeholder="36.9940814, -122.0612656"
					class="coordinate-input"
					onfocus={() => (isInputFocused = true)}
					onblur={() => (isInputFocused = false)}
				/>
				<button id="locate" class="outline" onclick={handleLocateMeClick}>
					<GeoLocate s={32} />
				</button>
			</div>
		</label>
	</div>

	<section id="map-wrapper">
		<p class="caption">Tap on the map to set its location.</p>
		<div id="map">
			{#if isDisplayable || isAtDefaultLocation}
				<MapboxMap
					latitude={coords.latitude}
					longitude={coords.longitude}
					allowClickToUpdateCoordinates={MAP_CONFIG.allowClickToUpdateCoordinates}
					showMarker={showMapMarker}
					showRadius={showMapMarker}
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
				text-align: center;
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
