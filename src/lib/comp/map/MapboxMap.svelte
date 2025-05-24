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
	let radiusCircleId = "marker-radius-circle";

	const DEFAULT_ZOOM = 14;
	const USER_ACTION_ZOOM = 18;
	let currentZoom = DEFAULT_ZOOM;

	const circleColor = "rgba(236, 120, 70, 0.5)";
	const radiusMeters = 20;

	onMount(() => {
		if (!mapContainer) return;

		mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;
		map = new mapboxgl.Map({
			container: mapContainer,
			style: "mapbox://styles/mapbox/dark-v11",
			center: [longitude, latitude],
			zoom: currentZoom,
			attributionControl: false
		});

		map.on("load", () => {
			setMarker();
			addRadiusCircle();
		});

		map.on("zoomend", () => {
			if (map) {
				currentZoom = map.getZoom();
			}
		});

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
		if (marker) {
			marker.remove();
		}
		if (map && typeof latitude === "number" && typeof longitude === "number" && showMarker) {
			const el = createCustomMarkerElement();
			marker = new mapboxgl.Marker({ element: el })
				.setLngLat([longitude, latitude])
				.addTo(map);
		}
	};

	const addRadiusCircle = () => {
		if (!map || typeof latitude !== "number" || typeof longitude !== "number" || !showMarker)
			return;

		// remove existing circle if it exists
		try {
			if (map.getSource(radiusCircleId)) {
				map.removeLayer(radiusCircleId);
				map.removeSource(radiusCircleId);
			}
		} catch (error) {
			// Layer/source may not exist, continue
		}

		// add the circle source
		map.addSource(radiusCircleId, {
			type: "geojson",
			data: {
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [longitude, latitude]
				},
				properties: {}
			}
		});

		// add the circle layer
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
	};

	const updateMapAndView = () => {
		if (map && typeof latitude === "number" && typeof longitude === "number") {
			map.flyTo({
				center: [longitude, latitude],
				zoom: currentZoom,
				essential: true
			});
			setMarker();
			addRadiusCircle();
		}
	};

	$effect(() => {
		if (!map || typeof latitude !== "number" || typeof longitude !== "number") return;

		if (map.isStyleLoaded()) {
			updateMapAndView();
		}
	});

	$effect(() => {
		if (!map) return;

		if (!map.isStyleLoaded()) {
			map.once("style.load", () => {
				if (typeof latitude === "number" && typeof longitude === "number") {
					updateMapAndView();
				}
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
