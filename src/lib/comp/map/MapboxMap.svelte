<script lang="ts">
	import { PUBLIC_MAPBOX_ACCESS_TOKEN } from "$env/static/public";
	import { roundCoordinate } from "$lib/comp/canvas/utils/Geolocation";
	import type { Map as MapboxMapType, Marker as MapboxMarkerType } from "mapbox-gl";
	import mapboxgl from "mapbox-gl";
	import "mapbox-gl/dist/mapbox-gl.css";
	import { onMount } from "svelte";

	const { Marker } = mapboxgl;

	interface Props {
		latitude: number;
		longitude: number;
		zoom?: number;
		allowClickToUpdateCoordinates?: boolean;
		forceZoomChange?: any;
	}

	let {
		latitude = $bindable(),
		longitude = $bindable(),
		zoom = $bindable(18),
		allowClickToUpdateCoordinates = false,
		forceZoomChange = undefined
	}: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: MapboxMapType | null = null;
	let marker: MapboxMarkerType | null = null;
	let radiusCircleId = "marker-radius-circle";

	const markerColor = "#ec7846";
	const circleColor = "rgba(236, 120, 70, 0.5)"; //at 50% transparency
	const radiusMeters = 20;

	onMount(() => {
		if (!mapContainer) return;

		mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;
		map = new mapboxgl.Map({
			container: mapContainer,
			style: "mapbox://styles/mapbox/dark-v11", // changed to DARK mode style :)
			center: [longitude, latitude],
			zoom: zoom,
			attributionControl: false
		});

		map.on("load", () => {
			setMarker();
			addRadiusCircle();
		});

		if (allowClickToUpdateCoordinates) {
			map.on("click", (e) => {
				if (map) {
					const clickedLat = roundCoordinate(e.lngLat.lat);
					const clickedLng = roundCoordinate(e.lngLat.lng);

					const clickTolerance = 0.0000001;
					if (
						Math.abs(latitude - clickedLat) > clickTolerance ||
						Math.abs(longitude - clickedLng) > clickTolerance
					) {
						latitude = clickedLat;
						longitude = clickedLng;
						// $effect will call updateMapAndView, which will handle zoom preservation
					}
				}
			});
		}

		return () => {
			map?.remove();
			map = null;
		};
	});

	// create a custom marker element with ORANGE color
	const createCustomMarkerElement = () => {
		const el = document.createElement("div");
		el.className = "custom-marker";
		return el;
	};

	const setMarker = () => {
		if (marker) {
			marker.remove();
		}
		if (map && typeof latitude === "number" && typeof longitude === "number") {
			const el = createCustomMarkerElement();
			marker = new Marker({ element: el, color: markerColor })
				.setLngLat([longitude, latitude])
				.addTo(map);
		}
	};

	// add a circle with a radius of 20 meters around the marker
	const addRadiusCircle = () => {
		if (!map || typeof latitude !== "number" || typeof longitude !== "number") return;

		// remove existing circle if it exists
		if (map.getSource(radiusCircleId)) {
			map.removeLayer(radiusCircleId);
			map.removeSource(radiusCircleId);
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
						[20, radiusMeters * 10] // adjust scale factor for better visibility
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
			let targetZoomForFlyTo = zoom; // Default to the component's zoom prop

			// if the zoom prop hasn't changed since the last $effect cycle (based on prevZoom),
			// and lat/lng have (implying a click or programmatic lat/lng update without zoom change),
			// then use the maps current actual zoom level to preserve user's manual zoom.
			if (zoom === prevZoom && (latitude !== prevLatitude || longitude !== prevLongitude)) {
				targetZoomForFlyTo = map.getZoom();
			}
			// If the zoom prop DID change, targetZoomForFlyTo will correctly be the new 'zoom' prop value.

			map.flyTo({
				center: [longitude, latitude],
				zoom: targetZoomForFlyTo,
				essential: true
			});
			setMarker();
			addRadiusCircle();
		}
	};

	let prevLatitude = latitude;
	let prevLongitude = longitude;
	let prevZoom = zoom;
	let prevForceZoomChange = forceZoomChange;

	$effect(() => {
		const latChanged = latitude !== prevLatitude;
		const lngChanged = longitude !== prevLongitude;
		const zoomChanged = zoom !== prevZoom;
		const forceZoomChanged = forceZoomChange !== prevForceZoomChange;

		if (latChanged || lngChanged || zoomChanged || forceZoomChanged) {
			if (map) {
				if (map.isStyleLoaded()) {
					// if forceZoomChange changed, always use zoom prop
					if (forceZoomChanged) {
						map.flyTo({
							center: [longitude, latitude],
							zoom: zoom,
							essential: true
						});
						setMarker();
						addRadiusCircle();
					} else {
						updateMapAndView();
					}
				} else {
					map.setCenter([longitude, latitude]);
					map.setZoom(zoom); // initial zoom setting
					setMarker();
					addRadiusCircle();

					map.once("style.load", () => {
						setMarker();
						addRadiusCircle();
					});
				}
			}
			prevLatitude = latitude;
			prevLongitude = longitude;
			prevZoom = zoom;
			prevForceZoomChange = forceZoomChange;
		}
	});
</script>

<div bind:this={mapContainer} class="map-container"></div>

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
		border-radius: 50%;
		background-color: #ec7846;
		border: 2px solid white;
		box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
		cursor: pointer;
	}
</style>
