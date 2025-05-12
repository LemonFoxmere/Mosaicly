<script lang="ts">
	import StepIndicator from "$lib/comp/canvas/create/StepIndicator.svelte";

	export let currentStep: number;
	export let stepTitle: string;
</script>

<div class="step-header-scrollable">
	<StepIndicator {currentStep} />
	<p class="step-subtitle"><strong>Step {currentStep}:</strong> {stepTitle}</p>
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
	@use "$static/stylesheets/fonts";

	.step-header-scrollable {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		width: 100%;
		margin-bottom: 12px;
	}

	.step-subtitle {
		@extend p;
		font-size: 14px;
		font-weight: 500;
		color: $text-primary;
		text-align: center;
		margin-bottom: 12px;

		strong {
			font-weight: 700;
		}
	}
</style>
