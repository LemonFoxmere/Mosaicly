<script lang="ts">
	import mapboxgl from "mapbox-gl";
	const { Marker } = mapboxgl;
	import type { Map as MapboxMapType, Marker as MapboxMarkerType, LngLatLike } from "mapbox-gl";
	import "mapbox-gl/dist/mapbox-gl.css";
	import { onMount } from "svelte";
	import { PUBLIC_MAPBOX_ACCESS_TOKEN } from "$env/static/public";
	import { roundCoordinate } from "$lib/comp/canvas/utils/Geolocation";

	interface Props {
		latitude: number;
		longitude: number;
		zoom?: number;
		allowClickToUpdateCoordinates?: boolean;
	}

	let {
		latitude = $bindable(),
		longitude = $bindable(),
		zoom = $bindable(15),
		allowClickToUpdateCoordinates = false
	}: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: MapboxMapType | null = null;
	let marker: MapboxMarkerType | null = null;

	const accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;

	onMount(() => {
		if (!accessToken) {
			console.error("Set PUBLIC_MAPBOX_ACCESS_TOKEN in your .env file.");
			return;
		}
		if (!mapContainer) return;

		mapboxgl.accessToken = accessToken;
		map = new mapboxgl.Map({
			container: mapContainer,
			style: "mapbox://styles/mapbox/streets-v12",
			center: [longitude, latitude],
			zoom: zoom,
			attributionControl: false
		});

		map.on("load", () => {
			setMarker();
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
						updateMapAndView();
					}
				}
			});
		}

		return () => {
			map?.remove();
			map = null;
		};
	});

	const setMarker = () => {
		if (marker) {
			marker.remove();
		}
		if (map && typeof latitude === "number" && typeof longitude === "number") {
			marker = new Marker().setLngLat([longitude, latitude]).addTo(map);
		}
	};

	const updateMapAndView = () => {
		if (map && typeof latitude === "number" && typeof longitude === "number") {
			map.flyTo({
				center: [longitude, latitude],
				zoom: zoom,
				essential: true
			});
			setMarker();
		}
	};

	let prevLatitude = latitude;
	let prevLongitude = longitude;
	let prevZoom = zoom;

	$effect(() => {
		const latChanged = latitude !== prevLatitude;
		const lngChanged = longitude !== prevLongitude;
		const zoomChanged = zoom !== prevZoom;

		if (latChanged || lngChanged || zoomChanged) {
			prevLatitude = latitude;
			prevLongitude = longitude;
			prevZoom = zoom;

			if (map) {
				if (map.isStyleLoaded()) {
					updateMapAndView();
				} else {
					map.setCenter([longitude, latitude]);
					map.setZoom(zoom);
					setMarker();

					map.once("style.load", () => {
						setMarker();
					});
				}
			}
		}
	});
</script>

<div bind:this={mapContainer} class="map-container"></div>

<style>
	.map-container {
		width: 100%;
		height: 100%;
		border-radius: 8px;
		overflow: hidden;
	}
</style>
