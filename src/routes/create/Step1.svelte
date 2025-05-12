<script lang="ts">
	import FormField from "$lib/comp/canvas/create/FormField.svelte";
	import StepHeader from "$lib/comp/canvas/create/StepHeader.svelte";

	interface Props {
		canvasName: string;
		locationDescription: string;
		currentStep: number;
	}
	let {
		canvasName = $bindable(),
		locationDescription = $bindable(),
		currentStep
	}: Props = $props();
</script>

<section class="step step-1">
	<StepHeader {currentStep} stepTitle="Some basic stuff." />

	<h1 class="page-main-title">Ready for shitposting?</h1>
	<p class="page-secondary-subtitle">Create a new canvas.</p>
	<div class="form-content">
		<FormField label="Canvas Name">
			<input type="text" bind:value={canvasName} placeholder="Frog" />
		</FormField>

		<FormField label="Location Description" stretch={true}>
			<span slot="label_append" aria-label="What is this?">(What is this?)</span>
			<textarea
				rows="8"
				bind:value={locationDescription}
				placeholder="On the pole near the entrance of the Cowell dining hall."
				class="location-description flex-fill"
			></textarea>
		</FormField>
	</div>
</section>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
	@use "$static/stylesheets/fonts";

	.step {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 15px;
		flex: 1 1 auto;
		min-height: 0;
	}

	.page-main-title {
		@extend h1;
		font-weight: 800;
		font-size: 30px;
		line-height: 1.2;
		text-align: left;
		width: 100%;
		margin-bottom: 0px;
	}

	.page-secondary-subtitle {
		@extend p;
		font-size: 16px;
		color: $text-secondary;
		text-align: left;
		margin-top: 0px;
		margin-bottom: 12px;
	}

	.form-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 24px;
		flex: 1 1 auto;
		min-height: 0;

		> label {
			display: flex;
			flex-direction: column;
		}

		> label:first-child {
			margin-bottom: 0;
		}

		.location-description {
			width: 100%;
			resize: none;
			height: 100%;
			flex: 1 1 auto;
			min-height: 0;
		}
	}
</style>
