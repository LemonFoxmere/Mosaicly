<script lang="ts">
	import MapboxMap from "$lib/comp/map/MapboxMap.svelte";
	import { formatDistance, type NearbyCanvas } from "$lib/comp/canvas/utils/Geolocation";

	interface Props {
		canvas: NearbyCanvas | null;
	}

	let { canvas }: Props = $props();
</script>

{#if canvas}
	<section id="map-popup-content">
		<div id="map-container">
			<MapboxMap
				latitude={canvas.latitude}
				longitude={canvas.longitude}
				showMarker={false}
				showRadius={true}
			/>
		</div>

		<p class="canvas-info">Distance: {formatDistance(canvas.distance_mi)}</p>
	</section>
{:else}
	<section id="map-popup-content">
		<div id="map-placeholder">
			<p>No canvas selected</p>
		</div>
	</section>
{/if}

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#map-popup-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;

		#map-container {
			width: 100%;
			height: min(400px, 50vh);
			border-radius: 8px;
			overflow: hidden;

			@media screen and (max-height: 600px) {
				height: 300px;
			}
		}

		#map-placeholder {
			width: 100%;
			height: min(400px, 50vh);
			background-color: $background-secondary;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;

			@media screen and (max-height: 600px) {
				height: 300px;
			}

			p {
				color: $background-primary;
			}
		}

		.canvas-info {
			color: $text-tertiary;
			margin: 0;
		}
	}
</style>
