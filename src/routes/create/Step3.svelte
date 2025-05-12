<script lang="ts">
	import { onMount } from "svelte";
	import StepHeader from "$lib/comp/canvas/create/StepHeader.svelte";

	interface Props {
		canvasName: string;
		onSave: () => void;
		currentStep: number;
	}
	let { canvasName, onSave, currentStep }: Props = $props();

	let actionButtonsGroup: HTMLElement;

	// ts was made to function to adjust button heights based on their width
	function adjustButtonHeights() {
		if (!actionButtonsGroup) return;

		const buttons = actionButtonsGroup.querySelectorAll(".action-button");
		buttons.forEach((button) => {
			const buttonWidth = button.clientWidth;
			if (button.clientHeight > buttonWidth) {
				(button as HTMLElement).style.height = `${buttonWidth}px`;
			}
		});
	}

	onMount(() => {
		adjustButtonHeights();
		window.addEventListener("resize", adjustButtonHeights);

		return () => {
			window.removeEventListener("resize", adjustButtonHeights);
		};
	});
</script>

<section class="step step-3">
	<StepHeader {currentStep} stepTitle="Final step." />

	<div class="form-content">
		<div class="final-message">
			<p class="heading"><strong>Congratulations, you did it.</strong></p>
			<p style="margin-top: 0.5rem;"></p>
			<p>
				Your "<strong>{canvasName || "Frog"}</strong>" canvas was created successfully, and
				is now visible to the public. If people can find where you put your QR code, they
				will be able to scan it and draw on your canvas.
			</p>
			<p class="heading whats-next"><strong>What's next?</strong></p>
			<p class="description">
				Click one of the buttons below to get a QR code of your canvas. You need to get this
				code into the real world somehow (most people like to print it out) and stick it to
				where your canvas coordinate is.
			</p>
		</div>

		<div class="action-buttons-group" bind:this={actionButtonsGroup}>
			<button type="button" class="action-button image-button" disabled></button>
			<button type="button" class="action-button pdf-button" disabled></button>
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
	}

	.form-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.final-message {
		text-align: left;
		margin-bottom: 0.5rem;
		margin-top: 8px;

		p {
			@extend p;
			margin: 0;
			padding: 0;
			line-height: 1.5;
			&.description {
				margin-top: 0.5rem;
			}
		}

		.spacing-element {
			height: 0.5rem;
		}

		.heading {
			@extend h2;
			font-size: 18px;
			font-weight: 700;
			color: $text-primary;

			&.whats-next {
				margin-top: 1rem;
			}
		}
	}

	.action-buttons-group {
		display: flex;
		justify-content: space-between;
		width: 100%;
		margin-top: 0.5rem;
		gap: 10px;
		height: 30vh;

		.action-button {
			@extend button, .outline;
			border-radius: 8px;
			width: calc(50% - 5px);
			height: 100%;
			min-height: 100px;
			max-height: 100%;
			padding: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			opacity: 0.4;
			cursor: not-allowed;
			box-sizing: border-box;

			&.image-button::before {
				content: "🖼️";
				font-size: 36px;
			}

			&.pdf-button::before {
				content: "📄";
				font-size: 36px;
			}

			&:hover,
			&:focus {
				opacity: 0.4 !important; // keep opacity consistent
			}

			&:active {
				opacity: 0.4 !important;
				transform: translateY(1.5px);
				border-bottom-width: 1.5px;
				margin-top: 0;
				height: 100%;
			}
		}
	}
</style>
