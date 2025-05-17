<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import {
		fetchCoordinatesForDisplay,
		roundCoordinate
	} from "$lib/comp/canvas/utils/Geolocation";
	import type { ActionResult } from "@sveltejs/kit";

	import ArrowNavCluster from "$lib/comp/canvas/create/ArrowNavCluster.svelte";
	import GalleryItem from "$lib/comp/canvas/create/GalleryItem.svelte";
	import StepHeader from "$lib/comp/canvas/create/StepHeader.svelte";
	import Step1 from "$lib/comp/canvas/create/steps/Step1.svelte";
	import Step2 from "$lib/comp/canvas/create/steps/Step2.svelte";
	import Step3 from "$lib/comp/canvas/create/steps/Step3.svelte";
	import { onMount } from "svelte";

	let currentStep = $state(1);
	let canvasName = $state("");
	let locationDescription = $state("");

	let canvasCoordinates = $state("");
	let formLatitude = $state(0.0);
	let formLongitude = $state(0.0);
	let formAccuracy = $state(0.0);
	let coordinateValid = $state(false);
	let canvasInputFocused = $state(false);

	// initialize to null so TS knows it's assigned
	let hiddenFormElement: HTMLFormElement | null = null;
	let errorState = $state({ flag: false, message: "" });

	const nextStep = () => {
		if (currentStep < 3) {
			currentStep++;
			const newUrl = new URL(window.location.href);
			newUrl.hash = `#s${currentStep}`;
			window.history.pushState({}, "", newUrl);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) currentStep--;
		const newUrl = new URL(window.location.href);
		newUrl.hash = `#s${currentStep}`;
		window.history.pushState({}, "", newUrl);
	};

	const handleLocateMeClick = async () => {
		errorState = { flag: false, message: "" };

		const coords = await fetchCoordinatesForDisplay();
		if (!coords) {
			errorState = {
				flag: true,
				message: "Failed to fetch coordinates or permission denied."
			};
			return;
		}

		// round here once
		coords.latitude = roundCoordinate(coords.latitude);
		coords.longitude = roundCoordinate(coords.longitude);

		canvasCoordinates = `${coords.latitude}, ${coords.longitude}`;
		formLatitude = coords.latitude;
		formLongitude = coords.longitude;
		formAccuracy = coords.accuracy;
	};

	// Parse and validate the coordinates input
	$effect(() => {
		coordinateValid = false;
		if (!canvasCoordinates) {
			errorState = { flag: false, message: "" };
			return;
		}

		const parts = canvasCoordinates.trim().split(",");
		if (parts.length !== 2) {
			errorState = {
				flag: true,
				message: "Coordinates must be in 'lat,long' format."
			};
			return;
		}

		const [latStr, longStr] = parts.map((s) => s.trim());
		const lat = Number(latStr);
		const long = Number(longStr);
		const valid =
			isFinite(lat) && isFinite(long) && Math.abs(lat) <= 90 && Math.abs(long) <= 180;

		if (!valid) {
			errorState = {
				flag: true,
				message: "Coordinates must be valid numbers within latitude/longitude bounds."
			};
			return;
		}

		coordinateValid = true;
		formLatitude = lat;
		formLongitude = long;
		errorState = { flag: false, message: "" };
	});

	// update canvasCoordinates from formLatitude/formLongitude when input is not focused
	$effect(() => {
		if (!canvasInputFocused) {
			const targetLat = roundCoordinate(formLatitude);
			const targetLong = roundCoordinate(formLongitude);
			const expectedCanvasString = `${targetLat}, ${targetLong}`;

			if (targetLat === 0 && targetLong === 0 && canvasCoordinates.trim() === "") {
				return;
			}

			if (canvasCoordinates.trim() !== expectedCanvasString) {
				canvasCoordinates = expectedCanvasString;
			}
		}
	});

	const saveCanvas = async () => {
		if (hiddenFormElement) {
			hiddenFormElement.requestSubmit();
		} else {
			errorState = {
				flag: true,
				message: "Error: Could not initiate save. Please try again."
			};
		}
	};

	const submitOptions = () => {
		return async ({
			result
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

	const routeChange = () => {
		const hash = window.location.hash;
		if (hash) {
			const step = parseInt(hash.replace("#s", ""));
			if (!isNaN(step) && step >= 1 && step <= 3) {
				currentStep = step;
			} else {
				const newUrl = new URL(window.location.href);
				newUrl.hash = "#s1";
				window.history.pushState({}, "", newUrl);
			}
		} else {
			const newUrl = new URL(window.location.href);
			newUrl.hash = "#s1";
			window.history.pushState({}, "", newUrl);
		}
	};

	onMount(routeChange);
</script>

<svelte:window on:hashchange={routeChange} />

<main>
	<StepHeader {currentStep} stepTitle="Some basic stuff." />

	<section id="page-content">
		<GalleryItem galleryIndex={currentStep} startVisIdx={1} endVisIdx={2}>
			<Step1 bind:canvasName bind:locationDescription />
		</GalleryItem>

		<GalleryItem galleryIndex={currentStep} startVisIdx={2} endVisIdx={3}>
			<Step2
				bind:canvasCoordinates
				bind:errorState
				bind:parsedLong={formLongitude}
				bind:parsedLat={formLatitude}
				bind:isFocused={canvasInputFocused}
				accuracy={formAccuracy}
				onLocate={handleLocateMeClick}
			/>
		</GalleryItem>

		<GalleryItem galleryIndex={currentStep} startVisIdx={3} endVisIdx={4}>
			<Step3 {canvasName} {currentStep} onSave={saveCanvas} />
		</GalleryItem>
	</section>

	<sect id="nav-container">
		<GalleryItem galleryIndex={currentStep} startVisIdx={1} endVisIdx={3}>
			<section id="arrow-cluster-container">
				<ArrowNavCluster
					onNext={nextStep}
					onBack={prevStep}
					leftDisabled={currentStep === 1}
					rightDisabled={(currentStep === 1 && !canvasName) ||
						(currentStep === 2 && (!coordinateValid || !canvasCoordinates))}
				/>
				<p id="error-msg" class="status">
					{errorState.message}
				</p>
			</section>
		</GalleryItem>

		<GalleryItem galleryIndex={currentStep} startVisIdx={3} endVisIdx={4}>
			<button id="return" on:click={saveCanvas}> Return to Canvas List </button>
		</GalleryItem>
	</sect>

	<section id="status"></section>

	<form
		id="hidden-form"
		method="post"
		action="/api/canvas?/createCanvas"
		use:enhance={submitOptions}
		bind:this={hiddenFormElement}
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

	main {
		position: relative;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		row-gap: 30px;
		align-items: center;
		padding: 15px 30px;
		width: 100%;
		height: 100%;
		margin: auto 0px;

		@media screen and (min-width: $mobile-width) {
			max-height: 700px;
			padding-bottom: $navbar-height;
		}

		#page-content {
			position: relative;
			width: 100%;
			display: flex;
			flex-direction: column;
			flex: 1;
		}

		#nav-container {
			width: 100%;
			height: 50px;
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;

			#arrow-cluster-container {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				row-gap: 10px;
			}

			#return {
				width: 100%;
				@media screen and (min-width: $mobile-width) {
					width: fit-content;
				}
			}
		}

		#error-msg {
			text-align: center;
			color: $accent-error;
		}

		#hidden-form {
			display: none;
			pointer-events: none;
		}
	}
</style>
