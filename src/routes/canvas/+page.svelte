<script lang="ts">
	import { RealtimePixelManager } from "$lib/comp/canvas/objects/RealtimePixelManager";
	import { LoaderCircle } from "@lucide/svelte";
	import Palette from "../../lib/comp/canvas/Palette.svelte";
	import PixelCanvas from "../../lib/comp/canvas/PixelCanvas.svelte";
	import { UserLocationListener } from "$lib/comp/canvas/objects/UserLocationListener.svelte";
	import { supabase } from "../../lib/supabaseClient";
	import { onDestroy, onMount } from "svelte";
	import type { PageProps } from "./$types";
	import { Value } from "sass";

	let { data }: PageProps = $props();

	// canvas infos
	const canvasID = data.canvas.id;
	const canvasDrawing = data.canvas.drawing; // will be used for initial canvas state
	const canvasTitle = data.canvas.title; // used for the title in the header
	const canvasLocDesc = data.canvas.loc_desc; // used for the description in the header
	let canvasLoaded = $state(false);

	// canvas location infos
	const canvasLatitude = data.canvas.latitude;
	const canvasLongitude = data.canvas.longitude;

	// realtime shit
	const channelName = data.channelName;
	const canvasChannel = supabase.channel(channelName, { config: { private: true } });
	const userDisplayName = data.user?.profile?.displayName ?? "";
	const userID = data.user?.account.id ?? "0";

	const realtimeManager = new RealtimePixelManager(canvasChannel, canvasID);

	// manages user location and state
	const userLocationListener = new UserLocationListener(canvasLatitude, canvasLongitude);

	let hasSession = $derived<boolean>(!!data.session);

	let selectedColor = $state("#000000");

	// if user is too far away from the canvas then force view mode (derived state can be updated since Svelte v5.25)
	let editState: "view" | "edit" | "inspect" = $derived.by(() => {
		if (!userLocationListener.userHasCanvasEditAccess()) {
			return "view"
		} else {
			return "view"
		}
	});

	const updateState = (newState: "view" | "edit" | "inspect") => {
		editState = newState;
	};

	const readyCanvas = () => {
		canvasLoaded = true;
	};

	onMount(() => {

		// set up user location listening on the browser (only needs to be done once, automatically removes any previous listener)
		userLocationListener.setupListener();
	})

	onDestroy(() => {
		userLocationListener.clearListener();
	})
</script>

<main>
	<section id="title-container" class="no-drag">
		<h2>{canvasTitle}</h2>
		<p>{canvasLocDesc}</p>
	</section>

	<section id="action-container">
		<button
			class={`${editState === "view" ? "solid" : "outline"}`}
			on:click={() => updateState("view")}
		>
			View
		</button>
		<button
			class={`${editState === "edit" ? "solid" : "outline"}`}
			disabled={!hasSession || !userLocationListener.userHasCanvasEditAccess()}
			on:click={() => updateState("edit")}
		>
			{#if !hasSession}
				Login to edit
			{:else}
				Edit
			{/if}
		</button>
		<!-- <button
			class={`${editState === "inspect" ? "solid" : "outline"}`}
			on:click={() => updateState("inspect")}
		>
			Inspect
		</button> -->
	</section>
	
	{#if userLocationListener.userHasCanvasLocationWait()}
		<!-- possibly a loading icon here? -->
	{:else if userLocationListener.userHasCanvasDistanceError()}
		<p class="err-msg">You need to move closer to the canvas to edit (currently {userLocationListener.getRoundedDistanceInFeet()} feet away)</p>
	{/if}

	<section id="canvas-container">
		<div id="loading-cover" class:hidden={canvasLoaded}>
			<LoaderCircle size={32} class="animate-spin" />
		</div>

		<div id="color-palette" class:hidden={editState === "view"}>
			<Palette
				changeColor={(_color: string) => {
					selectedColor = _color;
				}}
			></Palette>
		</div>

		<div id="canvas-wrapper" class:shrink={editState === "edit"}>
			<div id="canvas-content">
				<PixelCanvas
					color={selectedColor}
					mode={editState === "edit" ? "edit" : "view"}
					load={readyCanvas}
					backend={{
						supabase,
						realtimeManager,
						canvasChannel,
						userDisplayName,
						userID,
						canvasDrawing,
						channelName
					}}
				/>
			</div>
		</div>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: 100%;
		display: flex;
		flex-grow: 1;

		flex-direction: column;
		row-gap: 20px;
		padding: 10px 0px 10px 0px;

		@media screen and (min-width: $mobile-width) {
			// desktop
			max-height: 800px;
			flex-grow: 1;
			margin: auto 0;
			padding-bottom: $navbar-height;
		}

		// overflow: hidden;
		#title-container {
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			row-gap: 5px;
			align-items: flex-start;
			padding: 0px 20px;

			* {
				max-width: 100%;
			}

			h2 {
				// title 1 line
				display: -webkit-box;
				line-clamp: 1;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
			}
			p {
				// description 2 lines
				display: -webkit-box;
				line-clamp: 2;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		#action-container {
			display: flex;
			column-gap: 10px;
			width: 100%;
			padding: 0px 20px;

			button {
				width: 100%;
			}
		}

		.err-msg {
			width: 100%;
			text-align: center;
			padding: 0px 10px;
			color: $accent-error;
		}

		#canvas-container {
			position: relative;
			display: flex;
			align-items: center;
			flex-direction: column;
			padding: 0px 10px;
			flex-grow: 1;

			$movement-transition: 500ms $out-generic-expo;

			#loading-cover {
				position: absolute;
				top: -10px;
				left: -10px;

				z-index: 5;
				width: calc(100% + 20px);
				height: calc(100% + 10px);
				border-radius: 8px;

				display: flex;
				justify-content: center;
				align-items: center;
				background-color: $background-primary;

				transition: opacity 500ms $out-generic-expo;

				&.hidden {
					opacity: 0;
					pointer-events: none;
				}
			}

			#color-palette {
				z-index: 1;

				position: absolute;
				width: calc(100% - 20px); // account for padding
				max-width: 400px;

				transition: $movement-transition;
				transition-property: opacity, transform;

				&.hidden {
					opacity: 0;
					pointer-events: none;
					transform: translate(0px, -15px);
				}
			}

			#canvas-wrapper {
				z-index: 2;

				display: flex;
				width: 100%;
				flex: 1;
				border-radius: 8px;
				background-color: $text-primary;

				clip-path: rect(0px 100% 100% 0px round 8px);

				transition: $movement-transition;
				transition-property: clip-path, transform;

				overflow: hidden;

				#canvas-content {
					display: flex;
					width: 100%;
					flex: 1;

					transition: $movement-transition;
					transition-property: clip-path, transform;
				}

				// edit mode
				&.shrink {
					clip-path: rect(75px 100% 100% 0px round 8px);

					#canvas-content {
						transform: translate(0px, 40px);
					}
				}
			}

			&.hidden {
				opacity: 0;
				pointer-events: none;
				transform: translate(0px, -15px);
			}

			@media screen and (min-width: $mobile-width) {
				height: 100%;
				flex-grow: 1;
				height: fit-content;
			}
		}
	}
</style>
