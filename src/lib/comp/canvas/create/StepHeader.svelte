<script lang="ts">
	import StepIndicator from "$lib/comp/canvas/create/StepIndicator.svelte";

	interface Props {
		currentStep: number;
		stepTitle: string;
	}
	let { currentStep, stepTitle }: Props = $props();
</script>

<main>
	<StepIndicator {currentStep} />

	<p class="step-subtitle">
		<strong>Step {currentStep}:</strong>
		{stepTitle}
	</p>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		row-gap: 5px;
		width: 100%;
	}
</style>
