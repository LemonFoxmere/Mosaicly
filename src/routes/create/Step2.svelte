<script lang="ts">
	import FormField from "$lib/comp/canvas/create/FormField.svelte";
	import StepHeader from "$lib/comp/canvas/create/StepHeader.svelte";

	interface Props {
		canvasCoordinates: string;
		errorState: { flag: boolean; message: string };
		onLocate: () => void;
		currentStep: number;
	}
	let {
		canvasCoordinates = $bindable(),
		errorState = $bindable(),
		onLocate,
		currentStep
	}: Props = $props();
</script>

<section class="step step-2">
	<StepHeader {currentStep} stepTitle="Canvas details." />

	<div class="form-content">
		<FormField label="Canvas Coordinates">
			<div class="coordinate-input-wrapper">
				<input
					type="text"
					bind:value={canvasCoordinates}
					placeholder="36.99979, 122.06337"
				/>
				<button type="button" class="locate-button" on:click={onLocate}>🎯</button>
			</div>
		</FormField>

		{#if errorState.flag}
			<p class="error-message">{errorState.message}</p>
		{/if}
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
	}

	.form-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 15px;
		margin-top: 8px;

		.coordinate-input-wrapper {
			display: flex;
			align-items: center;
			gap: 10px;
			width: 100%;

			input[type="text"] {
				flex-grow: 1;
				width: 100%;
				background-color: transparent;
				border: 1.5px solid $text-primary;
				border-radius: 8px;
				padding: 12px 16px;
				font-size: 16px;
				line-height: 1.4;
				color: $text-primary;

				&::placeholder {
					color: $text-tertiary;
				}
			}

			.locate-button {
				@extend button, .outline;
				border-radius: 8px;
				height: 50px;
				width: 50px;
				min-width: 50px;
				padding: 0;
				font-size: 24px;
				box-sizing: border-box;

				&:focus-visible {
					outline: 2px solid $text-tertiary;
					outline-offset: 2px;
				}
			}
		}
	}

	.error-message {
		@extend p;
		color: $accent-error;
		font-size: 14px;
		margin-top: 10px;
	}
</style>
