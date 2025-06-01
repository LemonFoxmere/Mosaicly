<script lang="ts">
	import { QRUtils } from "$lib/comp/qrcode/utils/QrcodeUtils";
	import Document from "$lib/comp/ui/icons/Document.svelte";
	import Image from "$lib/comp/ui/icons/Image.svelte";
	import type { createPageModalModes } from "$route/create/+page.svelte";

	interface Props {
		canvasName: string;
		canvasBackupCode: string;
		modalTitle: string;
		modalSubtitle: string;
		modalOpened: boolean;
		modalMode: createPageModalModes;
	}
	let {
		canvasName,
		canvasBackupCode,
		modalTitle = $bindable<string>(""),
		modalSubtitle = $bindable<string>(""),
		modalOpened = $bindable<boolean>(false),
		modalMode = $bindable<createPageModalModes>(null)
	}: Props = $props();

	const generateQrImage = async () => {
		const { data: imgBlob, err } = await QRUtils.genImgBlob(canvasBackupCode);
		// err handling
		if (err || !imgBlob) {
			console.error("Failed to generate QR code:" + err);
			return;
		}

		// open it in a new tab
		window.open(URL.createObjectURL(imgBlob));
	};
	const generateQrPDF = async () => {
		const { data: pdfBlob, err } = await QRUtils.genPDFBlob(canvasBackupCode, canvasName);
		// err handling
		if (err || !pdfBlob) {
			console.error("Failed to generate PDF: " + err);
			return;
		}

		// convert blob to URL and open in new window
		const pdfURL = URL.createObjectURL(pdfBlob);
		window.open(pdfURL, "_blank");
	};
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
			<button class="outline" on:click={generateQrImage}>
				<Image s={22} /> Image
			</button>

			<button class="outline" on:click={generateQrPDF}>
				<Document s={22} /> PDF
			</button>
			<!-- PDF: QrSrc is full link -->
			<!-- <PdfExport
				QrSRC={"https://mosaicly.io/search/" + canvasBackupCode}
				BackupCode={canvasBackupCode}
				CanvasName={canvasName}
			></PdfExport> -->
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
