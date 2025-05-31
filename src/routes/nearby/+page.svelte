<script lang="ts">
	import { onMount } from "svelte";
	import { LoaderCircle, EllipsisIcon } from "@lucide/svelte";
	import Modal from "$lib/comp/ui/general/Modal.svelte";
	import CanvasListItem from "$lib/comp/nearby/CanvasListItem.svelte";
	import MapPopup from "$lib/comp/nearby/MapPopup.svelte";
	import {
		createLocationTracker,
		formatDistance,
		type NearbyCanvas
	} from "$lib/comp/canvas/utils/Geolocation";

	let canvases = $state<NearbyCanvas[]>([]);
	let isLoading = $state(false);
	let errorState = $state<"none" | "location" | "empty" | "fetch">("none");
	let errorMessage = $state<string>("");
	let locationTracker: ReturnType<typeof createLocationTracker> | null = null;

	let isModalOpen = $state(false);
	let selectedCanvas = $state<NearbyCanvas | null>(null);

	const fetchNearbyCanvases = async (lat: number, lon: number) => {
		isLoading = true;
		errorState = "none";
		errorMessage = "";

		try {
			const response = await fetch(`/api/canvas/nearby?lat=${lat}&lon=${lon}`);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`API Error (${response.status}): ${errorText || "Failed to fetch canvases"}`
				);
			}

			const data = await response.json();

			if (data.canvases.length === 0) {
				errorState = "empty";
			} else {
				canvases = data.canvases;
			}
		} catch (error) {
			errorState = "fetch";
			errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		} finally {
			isLoading = false;
		}
	};

	const initLocationTracking = async () => {
		isLoading = true;
		errorState = "none";
		errorMessage = "";

		locationTracker = createLocationTracker({
			onLocationUpdate: async (lat: number, lon: number) => {
				await fetchNearbyCanvases(lat, lon);
			},
			onError: (error: string) => {
				errorState = "location";
				errorMessage = error;
				isLoading = false;
			}
		});

		const result = await locationTracker.startTracking();

		if (!result.success) {
			errorState = "location";
			errorMessage = result.error || "Failed to start location tracking";
			isLoading = false;
		}
	};

	const refreshList = async () => {
		if (locationTracker) {
			locationTracker.stopTracking();
			locationTracker.resetTracking();
		}

		canvases = [];
		errorState = "none";
		errorMessage = "";

		await initLocationTracking();
	};

	const selectCanvas = (canvas: NearbyCanvas) => {
		selectedCanvas = canvas;
		isModalOpen = true;
	};

	onMount(() => {
		initLocationTracking();

		return () => {
			if (locationTracker) {
				locationTracker.stopTracking();
			}
		};
	});
</script>

<main>
	<section id="main-content">
		<section id="greeting-card">
			<h2>Nearby Canvases</h2>
			<p>Want some canvas to find nearby? Well here's 10 of them that should be near you.</p>
		</section>

		{#if isLoading}
			<div class="state-container">
				<LoaderCircle size={32} class="animate-spin" />
			</div>
		{:else if errorState === "location"}
			<div class="state-container error">
				<p>
					We were not able to get your location. Check your browser or privacy settings
					and try again.
				</p>
				{#if errorMessage}
					<p class="error-detail">{errorMessage}</p>
				{/if}
			</div>
		{:else if errorState === "empty"}
			<div class="state-container">
				<p class="empty-state">
					There are no canvases within a 30 mile radius of you. Try moving to a different
					location and try again.
				</p>
			</div>
		{:else if errorState === "fetch"}
			<div class="state-container error">
				<p>Something went wrong fetching canvases. Please try again.</p>
				{#if errorMessage}
					<p class="error-detail">{errorMessage}</p>
				{/if}
			</div>
		{:else if canvases.length > 0}
			<section id="canvas-list">
				{#each canvases as canvas (canvas.id)}
					<CanvasListItem
						title={canvas.title}
						locDesc={canvas.loc_desc}
						distance={formatDistance(canvas.distance_mi)}
						onClick={() => selectCanvas(canvas)}
					>
						{#snippet ctaOptions()}
							<button class="cta-button">
								<EllipsisIcon size={28} />
							</button>
						{/snippet}
					</CanvasListItem>
				{/each}
			</section>
		{/if}

		{#if !isLoading}
			<section id="refresh-section">
				{#if errorState !== "location"}
					<p>Can't find what you're looking for?</p>
				{/if}
				<button onclick={refreshList}>Refresh the List</button>
			</section>
		{/if}
	</section>

	<Modal
		bind:opened={isModalOpen}
		title={selectedCanvas?.title ?? ""}
		subtitle={selectedCanvas?.loc_desc ?? ""}
	>
		<MapPopup canvas={selectedCanvas} />
	</Modal>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	#main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 20px 30px calc(20px + $navbar-height) 30px;
		gap: 30px;
		max-width: calc($global-max-width - 60px);
		margin: 0 auto;
		width: 100%;

		@media screen and (min-width: $mobile-width) {
			padding-bottom: calc(30px + $navbar-height);
		}
	}

	#greeting-card {
		display: flex;
		flex-direction: column;
		gap: 10px;

		h2 {
			color: $text-primary;
			margin: 0;
		}

		p {
			color: $text-secondary;
			margin: 0;
		}
	}

	#canvas-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.state-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 30px;
		text-align: center;
		flex: 1;
		gap: 10px;

		p {
			color: $text-secondary;
			font-weight: 400;
			line-height: 22px;
		}

		&.error p {
			color: $accent-error;
		}

		.empty-state {
			font-weight: 700;
			color: $text-primary;
		}

		.error-detail {
			font-size: 14px;
			opacity: 0.8;
			max-width: 400px;
			word-break: break-word;
		}
	}

	#refresh-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;

		p {
			color: $text-secondary;
			margin: 0;
		}

		button {
			width: 100%;
			max-width: 342px;
		}
	}

	.cta-button {
		color: $text-primary;
		padding: 8px;
		border-radius: 8px;
		background: none;
		border: none;
		cursor: pointer;

		@media (hover: hover) {
			&:hover {
				opacity: 0.5;
			}
		}

		&:active {
			opacity: 1;
			transform: scale(0.8);
			background-color: $text-active-highlight;
		}
	}
</style>
