<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionResult } from "@sveltejs/kit";

	import ArrowNavCluster from "$lib/comp/canvas/create/ArrowNavCluster.svelte";
	import GalleryItem from "$lib/comp/canvas/create/GalleryItem.svelte";
	import StepHeader from "$lib/comp/canvas/create/StepHeader.svelte";
	import Step1 from "$lib/comp/canvas/create/steps/Step1.svelte";
	import Step2, { type Step2Data } from "$lib/comp/canvas/create/steps/Step2.svelte";
	import Step3 from "$lib/comp/canvas/create/steps/Step3.svelte";
	import { CircleCheck, LoaderCircle } from "@lucide/svelte";

	// step configs
	let currentStep = $state(1);
	const currentStepDescription = [
		"Some basic stuff.",
		"Where is this thing?",
		"Plaster it all over."
	];
	let canvasName = $state("");
	let locationDescription = $state("");

	// step validity and state
	let step1Valid = $state(false);
	let step2Valid = $state(false);
	let allInputValid = $derived(step1Valid && step2Valid);

	let step2Data = $state<Step2Data | null>(null);

	// for submission
	let hiddenFormElement: HTMLFormElement | null = null;

	// UI states
	let panicState = $state({ flag: false, message: "Failed to save data" });
	let canvasSaving = $state(false);
	let canvasSaved = $state(false);
	let isReturning = $state(false);

	const panic = (msg: string) => {
		panicState.flag = true;
		panicState.message = msg;
		canvasSaving = false; // make the message visible
	};

	const nextStep = () => {
		const nextStep = currentStep + 1;
		if (nextStep <= 2) {
			currentStep++;
		} else if (nextStep === 3) {
			// save canvas state
			saveCanvas();
		}
	};

	const prevStep = () => {
		if (currentStep > 1) currentStep--;
	};

	const handleStep2DataChange = (data: Step2Data) => {
		step2Data = data;
	};

	const saveCanvas = async () => {
		canvasSaving = true;

		if (hiddenFormElement) {
			hiddenFormElement.requestSubmit();
		} else {
			panic("Something is wrong with the frontend page. Please reload and try again.");
		}
	};

	const submitCallback = () => {
		return async ({
			result
		}: {
			formData: FormData;
			result: ActionResult;
			update: (opts?: any) => Promise<void>;
		}) => {
			if (result.type === "error") {
				panicState = {
					flag: true,
					message: result.error?.message || "An unknown error occurred."
				};
			} else if (result.type === "failure") {
				panicState = {
					flag: true,
					message: result.data?.message || "An unknown error occurred."
				};
			} else {
				// success
				canvasSaving = false;
				canvasSaved = true;
				panicState = { flag: false, message: "" }; // reset panic state

				setTimeout(() => {
					currentStep = 3;
				}, 500);
			}
		};
	};

	const isStepValid = (step: number): boolean => {
		switch (step) {
			case 1:
				return step1Valid;
			case 2:
				return allInputValid;
			default:
				return false;
		}
	};
</script>

<main>
	<section id="main-content">
		<StepHeader {currentStep} stepTitle={currentStepDescription[currentStep - 1]} />

		<section id="page-content">
			<GalleryItem galleryIndex={currentStep} startVisIdx={1} endVisIdx={2}>
				<Step1 bind:canvasName bind:locationDescription bind:valid={step1Valid} />
			</GalleryItem>

			<GalleryItem galleryIndex={currentStep} startVisIdx={2} endVisIdx={3}>
				<Step2 onDataChange={handleStep2DataChange} bind:valid={step2Valid} />
			</GalleryItem>

			<GalleryItem galleryIndex={currentStep} startVisIdx={3} endVisIdx={4}>
				<Step3 {canvasName} {currentStep} />
			</GalleryItem>
		</section>
	</section>

	<sect id="nav-container">
		<GalleryItem galleryIndex={currentStep} startVisIdx={1} endVisIdx={3}>
			<section id="arrow-cluster-container">
				{#if panicState.flag}
					<p class="err-msg">{panicState.message}</p>
				{:else if canvasSaving}
					<LoaderCircle size={32} class="animate-spin" />
				{:else if canvasSaved}
					<CircleCheck size={32} absoluteStrokeWidth={true} strokeWidth={2} />
				{:else}
					<ArrowNavCluster
						onNext={nextStep}
						onBack={prevStep}
						leftDisabled={currentStep === 1}
						rightDisabled={(currentStep === 1 && !isStepValid(1)) ||
							(currentStep === 2 && !isStepValid(2))}
					/>
				{/if}
			</section>
		</GalleryItem>

		<GalleryItem galleryIndex={currentStep} startVisIdx={3} endVisIdx={4}>
			<a
				id="return"
				href="/settings#canvas"
				on:click={() => {
					isReturning = true;
				}}
			>
				<button id="return">
					{#if isReturning}
						<LoaderCircle size={24} class="animate-spin" />
					{:else}
						Return to Canvas List
					{/if}
				</button>
			</a>
		</GalleryItem>
	</sect>
</main>

<form
	id="hidden-form"
	method="post"
	action="/api/canvas?/createCanvas"
	use:enhance={submitCallback}
	bind:this={hiddenFormElement}
>
	<input type="hidden" name="title" value={canvasName} />
	<input type="hidden" name="loc_desc" value={locationDescription} />
	<input type="hidden" name="latitude" value={step2Data?.coordinates.latitude ?? 0} />
	<input type="hidden" name="longitude" value={step2Data?.coordinates.longitude ?? 0} />
	<input type="hidden" name="accuracy" value={step2Data?.coordinates.accuracy ?? 0} />
</form>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		row-gap: 15px;
		padding: 15px 30px;
		width: 100%;
		flex-grow: 1;
		margin: auto 0px;

		@media screen and (min-width: $mobile-width) {
			max-height: 700px;
			padding-bottom: $navbar-height;
		}

		#main-content {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 100%;
			flex-grow: 1;

			row-gap: 30px;

			#page-content {
				position: relative;
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				flex-grow: 1;
			}
		}

		#nav-container {
			display: flex;
			width: 100%;
			min-height: 48px;
			flex: 0;

			position: relative;
			justify-content: center;
			align-items: center;

			.err-msg {
				color: $accent-error;
				text-align: center;
			}

			#arrow-cluster-container {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				row-gap: 10px;
			}

			#return {
				width: 100%;
				text-decoration: none;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}

		#error-msg {
			text-align: center;
			color: $accent-error;
		}
	}

	#hidden-form {
		display: none;
		pointer-events: none;
	}
</style>
