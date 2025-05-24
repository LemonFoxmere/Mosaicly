<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import type { ActionResult } from "@sveltejs/kit";

	import ArrowNavCluster from "$lib/comp/canvas/create/ArrowNavCluster.svelte";
	import GalleryItem from "$lib/comp/canvas/create/GalleryItem.svelte";
	import StepHeader from "$lib/comp/canvas/create/StepHeader.svelte";
	import Step1 from "$lib/comp/canvas/create/steps/Step1.svelte";
	import Step2, { type Step2Data } from "$lib/comp/canvas/create/steps/Step2.svelte";
	import Step3 from "$lib/comp/canvas/create/steps/Step3.svelte";

	let currentStep = $state(1);
	let canvasName = $state("");
	let locationDescription = $state("");

	let step2Data = $state<Step2Data | null>(null);

	let hiddenFormElement: HTMLFormElement | null = null;
	let errorState = $state({ flag: false, message: "" });

	const nextStep = () => {
		if (currentStep < 3) {
			currentStep++;
		}
	};

	const prevStep = () => {
		if (currentStep > 1) currentStep--;
	};

	const handleStep2DataChange = (data: Step2Data) => {
		step2Data = data;
	};

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

	const isStepValid = (step: number): boolean => {
		switch (step) {
			case 1:
				return !!canvasName;
			case 2:
				return isStepValid(1) && (step2Data?.isValid ?? false);
			default:
				return false;
		}
	};
</script>

<main>
	<section id="main-content">
		<StepHeader {currentStep} stepTitle="Some basic stuff." />

		<section id="page-content">
			<GalleryItem galleryIndex={currentStep} startVisIdx={1} endVisIdx={2}>
				<Step1 bind:canvasName bind:locationDescription />
			</GalleryItem>

			<GalleryItem galleryIndex={currentStep} startVisIdx={2} endVisIdx={3}>
				<Step2 onDataChange={handleStep2DataChange} />
			</GalleryItem>

			<GalleryItem galleryIndex={currentStep} startVisIdx={3} endVisIdx={4}>
				<Step3 {canvasName} {currentStep} onSave={saveCanvas} />
			</GalleryItem>
		</section>
	</section>

	<sect id="nav-container">
		<GalleryItem galleryIndex={currentStep} startVisIdx={1} endVisIdx={3}>
			<section id="arrow-cluster-container">
				<ArrowNavCluster
					onNext={nextStep}
					onBack={prevStep}
					leftDisabled={currentStep === 1}
					rightDisabled={(currentStep === 1 && !isStepValid(1)) ||
						(currentStep === 2 && !isStepValid(2))}
				/>
			</section>
		</GalleryItem>

		<GalleryItem galleryIndex={currentStep} startVisIdx={3} endVisIdx={4}>
			<button id="return" on:click={saveCanvas}> Return to Canvas List </button>
		</GalleryItem>
	</sect>
</main>

<form
	id="hidden-form"
	method="post"
	action="/api/canvas?/createCanvas"
	use:enhance={submitOptions}
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
	}

	#hidden-form {
		display: none;
		pointer-events: none;
	}
</style>
