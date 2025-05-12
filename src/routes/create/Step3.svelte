<script lang="ts">
	import StepHeader from "$lib/comp/canvas/create/StepHeader.svelte";

	interface Props {
		canvasName: string;
		onSave: () => void;
		currentStep: number;
		onQrImage?: () => void;
		onQrPdf?: () => void;
	}
	let { canvasName, onSave, currentStep, onQrImage, onQrPdf }: Props = $props();
</script>

<section class="step step-3">
	<StepHeader {currentStep} stepTitle="Final step." />

	<div class="form-content">
		<div class="final-message">
			<p class="heading"><strong>Congratulations, you did it.</strong></p>
			<p class="description">
				Your "<strong>{canvasName || "Frog"}</strong>" canvas was created successfully, and
				is now visible to the public. If people can find where you put your QR code, they
				will be able to scan it and draw on your canvas.
			</p>
			<p class="heading"><strong>What's next?</strong></p>
			<p class="description">
				Click one of the buttons below to get a QR code of your canvas. You need to get this
				code into the real world somehow (most people like to print it out) and stick it to
				where your canvas coordinate is.
			</p>
		</div>

		<div class="action-buttons-group">
			<div class="action-button-wrapper">
				<button
					type="button"
					class="action-button image-button"
					disabled={!onQrImage}
					on:click={() => onQrImage && onQrImage()}
				></button>
			</div>
			<div class="action-button-wrapper">
				<button
					type="button"
					class="action-button pdf-button"
					disabled={!onQrPdf}
					on:click={() => onQrPdf && onQrPdf()}
				></button>
			</div>
		</div>
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

	.form-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
		gap: 15px;
	}

	.final-message {
		flex: 0 0 auto;
		text-align: left;
		margin-bottom: 0.5rem;
		margin-top: 8px;
		overflow: auto;
		max-height: 30vh;

		p {
			@extend p;
			margin: 0;
			padding: 0;
			line-height: 1.5;
			&:not(:first-child) {
				margin-top: 0.5rem;
			}
			&.description {
				margin-top: 0.5rem;
			}
		}

		.heading {
			@extend h2;
			font-size: 18px;
			font-weight: 800;
			color: $text-primary;

			&.whats-next {
				margin-top: 1rem;
			}
		}
	}

	.action-buttons-group {
		display: flex;
		align-items: flex-start;
		justify-content: stretch;
		gap: 10px;
		min-height: 0;
		margin-top: 0;
	}

	.action-button-wrapper {
		width: 100%;
		min-width: 0;
		min-height: 0;
		display: flex;
		align-items: flex-start;
		justify-content: stretch;
	}

	.action-button {
		@extend button, .outline;
		width: 100%;
		height: auto;
		aspect-ratio: 1/1;
		border-radius: 8px;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;

		&.image-button::before {
			content: "🖼️";
			font-size: 2.25rem;
		}

		&.pdf-button::before {
			content: "📄";
			font-size: 2.25rem;
		}

		&:focus-visible {
			outline: 2px solid $text-tertiary;
			outline-offset: 2px;
		}

		&:not(:disabled) {
			cursor: pointer;
			opacity: 1;
			pointer-events: auto;
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 0.3;
			pointer-events: none;
			&:active {
				margin-top: 0;
				height: auto;
				border-bottom-width: 4px;
				transform: none;
			}
		}
	}
</style>
