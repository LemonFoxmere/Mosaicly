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
					class="coordinate-input flex-fill"
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

			.coordinate-input {
				flex: 1 1 auto;
				min-width: 0;
			}

			.locate-button {
				@extend button;
				width: 60px;
				height: 60px;
				border-radius: 8px;
				border: 1.5px solid $text-primary;
				border-bottom-width: 4px;
				background-color: $background-primary;
				color: $text-primary;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 24px;
				padding: 0;
				transition: opacity 300ms $out-generic-expo;

				&:active {
					margin-top: 1.5px;
					height: calc(60px - 1.5px);
					border-bottom-width: 1.5px;
					transform: translateY(1.5px);
				}

				&:disabled {
					opacity: 0.3;
					pointer-events: none;
					margin-top: 0;
					height: 60px;
					border-bottom-width: 4px;
					transform: none;
				}

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
		margin-top: 0;
	}
</style>
