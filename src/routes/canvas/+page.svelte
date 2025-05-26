<script lang="ts">
	import { RealtimePixelManager } from "$lib/comp/canvas/objects/RealtimePixelManager";
	import Palette from "../../lib/comp/canvas/Palette.svelte";
	import PixelCanvas from "../../lib/comp/canvas/PixelCanvas.svelte";
	import { supabase } from "../../lib/supabaseClient";
	import type { PageProps } from "./$types";

	let selectedColor = $state("#000000");
	let editState: "view" | "edit" | "inspect" = $state("view");

	let { data }: PageProps = $props();

	// const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// props
	let canvasInfo = $derived(<DB.Canvas>(data.canvas || {}));

	let channelName = $derived(data.channelName);
	let canvasChannel = $derived(supabase.channel(channelName, { config: { private: true } }));
	let canvasID = $derived(canvasInfo.id);
	let canvasDrawing = $derived(canvasInfo.drawing); // will be used for initial canvas state
	let userDisplayName = $derived(data.user?.profile?.displayName ?? "");
	let userID = $derived(data.user?.account.id ?? "0");

	let realtimeManager = $derived(new RealtimePixelManager(canvasChannel, canvasID));

	let editable = $state(true);

	const updateState = (newState: "view" | "edit" | "inspect") => {
		editState = newState;
		// TODO: do checking here
	};
</script>

<main>
	<section id="title-container" class="no-drag">
		<h2>Frog</h2>
		<p>On the pole near the entrance of the Cowell dining hall.</p>
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
			disabled={!editable}
			on:click={() => updateState("edit")}
		>
			Edit
		</button>
		<button
			class={`${editState === "inspect" ? "solid" : "outline"}`}
			on:click={() => updateState("inspect")}
		>
			Inspect
		</button>
	</section>

	<section id="canvas-container">
		{#if editState != "view"}
			<Palette
				changeColor={(_color: string) => {
					selectedColor = _color;
				}} />
		{/if}

		<PixelCanvas
			color={selectedColor}
			mode={editState === "edit" ? "edit" : "view"}
			load={() => {}}
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
			height: fit-content;
			flex-grow: 0;
			margin: auto 0;
			padding-bottom: $navbar-height;
		}

		// overflow: hidden;
		#title-container {
			width: 100%;
			display: flex;
			justify-content: space-between;
			column-gap: 20px;
			align-items: center;
			padding: 0px 20px;
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
			display: flex;
			flex-direction: column;
			row-gap: 5px;
			padding: 0px 10px;
			flex-grow: 1;

			@media screen and (min-width: $mobile-width) {
				height: 100%;
				flex-grow: 0;
				height: fit-content;
			}
		}
	}
</style>
