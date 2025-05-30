<script lang="ts">
	import Modal from "$lib/comp/ui/general/Modal.svelte";
	import Pencil from "$lib/comp/ui/icons/Pencil.svelte";
	import CanvasCard from "$lib/comp/ui/listItems/CanvasCard.svelte";
	import { EllipsisIcon, LoaderCircle } from "@lucide/svelte";
	import { onMount } from "svelte";
	import EditCanvas from "../modalContent/EditCanvas.svelte";

	interface Props {
		user: DB.AppUser | null | undefined;
		canvases: DB.Canvas[];
	}
	let { user = $bindable<DB.AppUser>(), canvases = $bindable<DB.Canvas[]>([]) }: Props = $props();

	// canvas modal states
	let isLoaded = $state(false); // for loading canvases
	let panicState = $state({
		// for load error handling
		flag: false,
		message: ""
	});
	const panic = (message: string) => {
		panicState = {
			flag: true,
			message
		};
	};

	let isOpen = $state(false);
	let selectedCanvas = $state<DB.Canvas>();
	let editedModalTitle = $state("");
	let isReloading = $state(false);

	const editThisCanvas = (canvas: DB.Canvas) => {
		selectedCanvas = canvas;
		isOpen = true;
	};

	// helper for date
	const dateOptions: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour12: true
	};
	const formatDate = (date: string | Date) => {
		const d = typeof date === "string" ? new Date(date) : date;
		return d.toLocaleString("en-US", dateOptions).replace(" at", " @");
	};

	// init function to get all the canvases
	const fetchCanvases = async (): Promise<{ ok: boolean; err: string }> => {
		if (!user) return { ok: false, err: "User is not logged in." };
		if (canvases.length > 0) {
			// already loaded
			return { ok: true, err: "" };
		}

		// returns if loaded is ok
		const resp = await fetch(`/api/canvas?u=${user.account.id}`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			}
		});

		if (!resp.ok) {
			const err = await resp.text();
			return { ok: false, err };
		}

		const data = await resp.json();
		if (!Array.isArray(data)) {
			// check type
			return { ok: false, err: "Invalid response format." };
		}

		canvases = data as DB.Canvas[];

		return { ok: true, err: "" };
	};
	const init = async () => {
		const { ok, err } = await fetchCanvases();

		if (!ok) {
			panic(err);
			return;
		}

		isLoaded = true;
	};
	onMount(init);
</script>

<main class="no-drag">
	{#if !panicState.flag}
		{#if isLoaded}
			<!-- canvases list render -->
			{#if canvases.length > 0}
				<div id="canvas-list">
					{#each canvases as canvas (canvas.id)}
						<CanvasCard {canvas}>
							{#snippet caption()}
								<p class="canvas-card-caption">
									Created on <span>{formatDate(canvas.createdOn)}</span>
								</p>
							{/snippet}

							{#snippet ctaOptions()}
								<!-- Edit button -->
								<button
									id="edit-canvas"
									class="none canvas-card-cta"
									onclick={() => {
										editThisCanvas(canvas);
									}}
								>
									<Pencil s={28} />
								</button>

								<!-- More options -->
								<button
									id="edit-canvas"
									class="none canvas-card-cta"
									onclick={() => {
										editThisCanvas(canvas);
									}}
								>
									<EllipsisIcon size={28} />
								</button>
							{/snippet}
						</CanvasCard>
					{/each}
				</div>
			{:else}
				<div class="placeholder-container">
					<p>Nothing here yet. ¯\_(ツ)_/¯</p>
				</div>
			{/if}

			<Modal bind:opened={isOpen} title={`Editing "${editedModalTitle}"`}>
				<EditCanvas
					bind:opened={isOpen}
					bind:canvas={selectedCanvas}
					bind:editedTitle={editedModalTitle}
				/>
			</Modal>
		{:else}
			<div class="placeholder-container">
				<LoaderCircle size={32} class="animate-spin" />
			</div>
		{/if}
		<!-- redirects the user to add new canvas -->
		<a id="new-canvas" href="/create">
			<button> New Canvas </button>
		</a>
	{:else}
		<!-- something went very wrong -->
		<section id="panic-state">
			<section id="text">
				<p class="title">Yikes, we couldn't get your canvases.</p>
				<p><em>{panicState.message}</em></p>
			</section>
			<!-- reload button -->
			<button
				onclick={() => {
					window.location.reload();
					isReloading = true;
				}}
				disabled={isReloading}
			>
				{#if !isReloading}
					Reload and Try Again
				{:else}
					<LoaderCircle class="animate-spin" />
				{/if}
			</button>
		</section>
	{/if}
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		justify-content: flex-start;

		.placeholder-container {
			width: 100%;
			height: 100px;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		#canvas-list {
			display: flex;
			flex-direction: column;
			justify-content: center;
			row-gap: 10px;

			.canvas-card-cta {
				display: flex;
				justify-content: center;
				align-items: center;

				width: 48px;
				height: 48px;
				cursor: pointer;
				border-radius: 8px;
			}

			.canvas-card-caption {
				span {
					white-space: nowrap; // do not wrap things like date
				}
			}
		}

		#new-canvas {
			position: sticky;
			bottom: 0px;

			width: 100%;
			padding: 20px 0px;

			text-decoration: none;
			background: linear-gradient(transparent, $background-primary);

			button {
				width: 100%;
			}
		}

		#panic-state {
			position: relative;

			width: 100%;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			row-gap: 30px;

			#text {
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;

				padding-bottom: 50px; // offset from the button
			}

			button {
				position: absolute;
				bottom: 0px;

				width: 100%;

				&:disabled {
					opacity: 1 !important;
				}
			}
		}
	}
</style>
