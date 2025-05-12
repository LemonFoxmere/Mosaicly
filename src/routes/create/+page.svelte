<script lang="ts">
	import { goto } from "$app/navigation";
	import { enhance } from "$app/forms";
	import { fetchCoordinatesForDisplay } from "$lib/comp/canvas/utils/Geolocation";
	import type { ActionResult } from "@sveltejs/kit";

	import Step1 from "./Step1.svelte";
	import Step2 from "./Step2.svelte";
	import Step3 from "./Step3.svelte";
	import NavCluster from "$lib/comp/canvas/create/NavCluster.svelte";

	// reactive state
	let currentStep = $state(1);

	let canvasName = $state("");
	let locationDescription = $state("");
	let canvasCoordinates = $state("");

	let formLatitude = $state("");
	let formLongitude = $state("");
	let formAccuracy = $state("");

	// hidden form ref
	let hiddenFormElement: HTMLFormElement;

	// error handling
	let errorState = $state({ flag: false, message: "" });

	const nextStep = () => {
		if (currentStep < 3) currentStep++;
	};
	const prevStep = () => {
		if (currentStep > 1) currentStep--;
	};

	const handleLocateMeClick = async () => {
		errorState = { flag: false, message: "" };
		const coords = await fetchCoordinatesForDisplay();
		if (coords) {
			canvasCoordinates = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
			formLatitude = String(coords.latitude);
			formLongitude = String(coords.longitude);
			formAccuracy = String(coords.accuracy);
		} else {
			errorState = {
				flag: true,
				message: "Failed to fetch coordinates or permission denied."
			};
		}
	};

	const saveCanvas = async () => {
		if (hiddenFormElement) hiddenFormElement.requestSubmit();
		else
			errorState = {
				flag: true,
				message: "Error: Could not initiate save. Please try again."
			};
	};

	const submitOptions = () => {
		return async ({
			formData,
			result,
			update
		}: {
			formData: FormData;
			result: ActionResult;
			update: (opts?: any) => Promise<void>;
		}) => {
			if (result.type === "error") {
				errorState = {
					flag: true,
					message: result.error?.message || "An unknown error occurred."
				};
			} else if (result.type === "failure") {
				errorState = {
					flag: true,
					message: result.data?.message || "An unknown error occurred."
				};
			} else {
				goto("/profile");
			}
		};
	};
</script>

<main class="create-canvas-page">
	<div class="page-content">
		<style>
			/* Styles removed as they are now in Step2.svelte */
		</style>

		{#if currentStep === 1}
			<Step1 bind:canvasName bind:locationDescription {currentStep} />
		{:else if currentStep === 2}
			<Step2
				bind:canvasCoordinates
				bind:errorState
				{currentStep}
				onLocate={handleLocateMeClick}
			/>
		{:else}
			<Step3 {canvasName} {currentStep} onSave={saveCanvas} />
		{/if}
	</div>

	{#if currentStep < 3}
		<div class="bottom-nav-container" class:step-1={currentStep === 1}>
			<NavCluster onNext={nextStep} onBack={prevStep} hideBack={currentStep === 1} />
		</div>
	{:else if currentStep === 3}
		<div class="bottom-nav-container">
			<button type="button" class="return-button" on:click={saveCanvas}>
				Save and Return to Canvas List
			</button>
		</div>
	{/if}

	<form
		method="post"
		action="/api/canvas?/createCanvas"
		use:enhance={submitOptions}
		bind:this={hiddenFormElement}
		style="display: none;"
	>
		<input type="hidden" name="title" value={canvasName} />
		<input type="hidden" name="loc_desc" value={locationDescription} />
		<input type="hidden" name="latitude" bind:value={formLatitude} />
		<input type="hidden" name="longitude" bind:value={formLongitude} />
		<input type="hidden" name="accuracy" bind:value={formAccuracy} />
	</form>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
	@use "$static/stylesheets/fonts";

	/* Container & Headings */
	.create-canvas-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 20px;
		padding-top: 20px;
		min-height: 100vh;
		background-color: $background-primary;
		color: $text-primary;
		width: 100%;
		max-width: $global-max-width;
		margin: 0 auto;
		position: relative;
		padding-bottom: 20px;
	}

	.page-content {
		width: 100%;
		flex-grow: 1;
		padding-bottom: 0;
		margin-bottom: 20px;
	}

	.bottom-nav-container {
		background-color: $background-primary;
		padding: 15px 0;
		width: 100%;
		max-width: $global-max-width;
		margin-left: auto;
		margin-right: auto;
		display: flex;
		justify-content: center;

		&:not(.step-1) {
			margin-top: auto;
		}
	}

	.return-button {
		@extend button;
		border-radius: 8px;
		width: 100%;
		height: 50px;
		font-size: 16px;
	}
</style>
