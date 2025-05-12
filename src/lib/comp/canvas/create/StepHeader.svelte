<script lang="ts">
	import StepIndicator from "$lib/comp/canvas/create/StepIndicator.svelte";

	interface Props {
		currentStep: number;
		stepTitle: string;
	}
	let { currentStep, stepTitle }: Props = $props();
</script>

<header class="step-header">
	<StepIndicator {currentStep} />
	<p class="step-subtitle">
		<strong>Step {currentStep}:</strong>
		{stepTitle}
	</p>
</header>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
	@use "$static/stylesheets/fonts";

	.step-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: 100%;
		margin-bottom: 12px;
	}

	.step-subtitle {
		font-size: 14px;
		color: $text-primary;
		text-align: center;
	}
</style>
