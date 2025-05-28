<script lang="ts">
	import Document from "$lib/comp/ui/icons/Document.svelte";
	import Image from "$lib/comp/ui/icons/Image.svelte";

	interface Props {
		canvasName: string;
		canvasBackupCode: string;
		currentStep: number;
		onQrImage?: () => void;
		onQrPdf?: () => void;
	}
	let { canvasName, canvasBackupCode, currentStep, onQrImage, onQrPdf }: Props = $props();
</script>

<main>
	<section id="congrats">
		<p class="title">Congratulations, you did it.</p>
		<p class="description">
			Your "<strong>{canvasName ?? ""}</strong>" canvas was created successfully with the code
			<strong>{canvasBackupCode ?? ""}</strong>, and is now visible to the public. If people
			can find where you put your QR code, they will be able to scan it and draw on your
			canvas.
		</p>
	</section>

	<section id="whats-next">
		<section id="message">
			<p class="title">What's next?</p>
			<p class="description">
				Click one of the buttons below to get a QR code of your canvas. You need to get this
				code into the real world somehow (most people like to print it out) and stick it to
				where your canvas coordinate is.
			</p>
		</section>

		<section id="cta">
			<button class="outline" on:click={() => onQrImage && onQrImage()}>
				<Image s={22} />
				Image
			</button>
			<button class="outline" on:click={() => onQrPdf && onQrPdf()}>
				<Document s={22} />
				PDF
			</button>
		</section>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;
		row-gap: 20px;

		@media screen and (min-width: $mobile-width) {
			height: fit-content;
		}

		#congrats {
			width: 100%;

			display: flex;
			flex-direction: column;
			row-gap: 5px;
		}

		#whats-next {
			width: 100%;
			height: 100%;

			display: flex;
			flex-direction: column;
			row-gap: 15px;

			@media screen and (min-width: $mobile-width) {
				height: fit-content;
			}

			#message {
				display: flex;
				flex-direction: column;
				row-gap: 5px;
			}

			#cta {
				width: 100%;
				height: 100%;

				display: flex;
				flex-direction: row;
				column-gap: 10px;

				button {
					flex-grow: 1;
					height: 100%;
					max-height: 130px;

					display: flex;
					flex-direction: column;
					row-gap: 5px;

					color: $text-primary;

					@media screen and (min-width: $mobile-width) {
						height: 130px;
					}
				}
			}
		}
	}
</style>
