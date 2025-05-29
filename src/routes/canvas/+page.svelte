<script lang="ts">
	import { RealtimePixelManager } from "$lib/comp/canvas/objects/RealtimePixelManager";
	import { LoaderCircle } from "@lucide/svelte";
	import Palette from "../../lib/comp/canvas/Palette.svelte";
	import PixelCanvas from "../../lib/comp/canvas/PixelCanvas.svelte";
	import { supabase } from "../../lib/supabaseClient";
	import type { PageProps } from "./$types";

	let selectedColor = $state("#000000");
	let editState: "view" | "edit" | "inspect" = $state("view");

	let { data }: PageProps = $props();

	// canvas infos
	let canvasID = $derived(data.canvas.id);
	let canvasDrawing = $derived(data.canvas.drawing); // will be used for initial canvas state
	let canvasTitle = $derived(data.canvas.title); // used for the title in the header
	let canvasLocDesc = $derived(data.canvas.loc_desc); // used for the description in the header
	let canvasLoaded = $state(false);

	// realtime shit
	let channelName = $derived(data.channelName);
	let canvasChannel = $derived(supabase.channel(channelName, { config: { private: true } }));
	let userDisplayName = $derived(data.user?.profile?.displayName ?? "");
	let userID = $derived(data.user?.account.id ?? "0");

	let realtimeManager = $derived(new RealtimePixelManager(canvasChannel, canvasID));

	let hasSession = $derived<boolean>(!!data.session);

	const updateState = (newState: "view" | "edit" | "inspect") => {
		editState = newState;
	};

	const readyCanvas = () => {
		canvasLoaded = true;
	};
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
			disabled={!hasSession}
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

	<section id="canvas-container">
		<div id="loading-cover" class:hidden={canvasLoaded}>
			<LoaderCircle size={32} class="animate-spin" />
		</div>

		<Palette
			changeColor={(_color: string) => {
				selectedColor = _color;
			}}
		></Palette>

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
				canvasDrawing
			}}
		/>
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
		padding: 10px 0px 8px 0px; // less on the bottom cuz of some optical illustion shit

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

		#canvas-container {
			position: relative;
			display: flex;
			flex-direction: column;
			row-gap: 5px;
			padding: 0px 10px;
			flex-grow: 1;

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

			@media screen and (min-width: $mobile-width) {
				height: 100%;
				flex-grow: 1;
				height: fit-content;
			}
		}
	}
</style>
