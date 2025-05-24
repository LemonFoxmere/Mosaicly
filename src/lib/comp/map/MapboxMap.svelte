<script lang="ts">
	import { PUBLIC_MAPBOX_ACCESS_TOKEN } from "$env/static/public";
	import type { Map as MapboxMapType, Marker as MapboxMarkerType } from "mapbox-gl";
	import mapboxgl from "mapbox-gl";
	import "mapbox-gl/dist/mapbox-gl.css";
	import { onMount } from "svelte";

	interface Props {
		latitude: number;
		longitude: number;
		allowClickToUpdateCoordinates?: boolean;
		showMarker?: boolean;
		onClickWithCoords?: (lat: number, lng: number) => void;
	}

	let {
		latitude = $bindable(),
		longitude = $bindable(),
		allowClickToUpdateCoordinates = false,
		showMarker = true,
		onClickWithCoords = undefined
	}: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: MapboxMapType | null = null;
	let marker: MapboxMarkerType | null = null;
	let radiusCircleId: string = "marker-radius-circle";

	const DEFAULT_COORDS = { lat: 36.9975733, lng: -122.0572861 }; // the default coords
	const DEFAULT_ZOOM: number = 14; // default zoom level on init
	const USER_ACTION_ZOOM: number = 18; // zoom when user performs an action
	let currentZoom: number = DEFAULT_ZOOM;

	const circleColor: string = "rgba(236, 120, 70, 0.5)";
	const radiusMeters: number = 20;

	onMount(() => {
		if (!mapContainer) return; // safety check

		// Initialize Mapbox GL JS
		mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;
		map = new mapboxgl.Map({
			container: mapContainer,
			style: "mapbox://styles/mapbox/dark-v11",
			center: [DEFAULT_COORDS.lng, DEFAULT_COORDS.lat],
			zoom: currentZoom,
			attributionControl: false
		});

		// Add navigation controls
		map.on("load", () => {
			setMarker();
			addRadiusCircle();
		});
		map.on("zoomend", () => {
			if (map) {
				currentZoom = map.getZoom();
			}
		});

		// Add click control to add markers
		if (allowClickToUpdateCoordinates) {
			map.on("click", (e) => {
				if (onClickWithCoords) {
					const clickedLat = e.lngLat.lat;
					const clickedLng = e.lngLat.lng;
					currentZoom = USER_ACTION_ZOOM;
					onClickWithCoords(clickedLat, clickedLng);
				}
			});
		}

		// Cleanup function to remove the map instance when the component is destroyed
		return () => {
			map?.remove();
			map = null;
		};
	});

	const createCustomMarkerElement = () => {
		const el = document.createElement("div");
		el.className = "custom-marker";
		return el;
	};

	const setMarker = () => {
		if (
			map &&
			typeof latitude === "number" &&
			typeof longitude === "number" &&
			!isNaN(latitude) &&
			!isNaN(longitude) &&
			showMarker
		) {
			if (marker) {
				marker.setLngLat([longitude, latitude]);
			} else {
				const el = createCustomMarkerElement();
				marker = new mapboxgl.Marker({ element: el })
					.setLngLat([longitude, latitude])
					.addTo(map);
			}
		} else if (marker) {
			marker.remove();
			marker = null;
		}
	};

	const addRadiusCircle = () => {
		if (
			!map ||
			typeof latitude !== "number" ||
			typeof longitude !== "number" ||
			isNaN(latitude) ||
			isNaN(longitude) ||
			!showMarker
		)
			return;

		const circleData: GeoJSON.Feature<GeoJSON.Geometry> = {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [longitude, latitude]
			},
			properties: {}
		};

		const source = map.getSource(radiusCircleId) as mapboxgl.GeoJSONSource | undefined;

		if (source) {
			source.setData(circleData);
		} else {
			map.addSource(radiusCircleId, {
				type: "geojson",
				data: circleData
			});

			map.addLayer({
				id: radiusCircleId,
				type: "circle",
				source: radiusCircleId,
				paint: {
					"circle-radius": {
						stops: [
							[0, 0],
							[20, radiusMeters * 10]
						],
						base: 2
					},
					"circle-color": circleColor,
					"circle-opacity": 0.5,
					"circle-stroke-width": 0
				}
			});
		}
	};

	const updateMapAndView = () => {
		if (
			map &&
			typeof latitude === "number" &&
			typeof longitude === "number" &&
			!isNaN(latitude) &&
			!isNaN(longitude)
		) {
			// Ensure the map is centered on the new coordinates with the current zoom level
			map.flyTo({
				center: [longitude, latitude],
				zoom: USER_ACTION_ZOOM,
				essential: true
			});
			setMarker();
			addRadiusCircle();
		}
	};

	$effect(() => {
		// This effect runs whenever latitude or longitude changes
		if (
			!map ||
			typeof latitude !== "number" ||
			typeof longitude !== "number" ||
			isNaN(latitude) ||
			isNaN(longitude)
		)
			return;

		if (map.isStyleLoaded()) {
			// update map and view if the style is already loaded
			updateMapAndView();
		} else {
			// if the style is not loaded yet, wait for it to load
			map.once("style.load", () => {
				updateMapAndView();
			});
		}
	});
</script>

<div bind:this={mapContainer} class="map-container" />

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.map-container {
		width: 100%;
		height: 100%;
		border-radius: 8px;
		overflow: hidden;
	}

	:global(.custom-marker) {
		width: 24px;
		height: 24px;
		border-radius: 24px;
		background-color: $background-primary;
		border: 2px solid $background-accent;
		box-shadow: 0 0 2px hsla(0deg, 0%, 0%, 25%);
		cursor: pointer;
	}

	:global(.mapboxgl-ctrl) {
		margin: 0 0 18px 20px !important;
		opacity: 0.3 !important;
	}
</style>
