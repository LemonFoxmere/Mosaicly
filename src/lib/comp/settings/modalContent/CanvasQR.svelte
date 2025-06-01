<script lang="ts">
	import { QRUtils } from "$lib/comp/qrcode/utils/QrcodeUtils";
	import Document from "$lib/comp/ui/icons/Document.svelte";
	import Image from "$lib/comp/ui/icons/Image.svelte";

	interface Props {
		opened: boolean;
		canvas: DB.Canvas | undefined;
	}
	let {
		opened: open = $bindable<boolean>(),
		canvas = $bindable<DB.Canvas | undefined>()
	}: Props = $props();

	let saveAnchor: HTMLAnchorElement;

	const genImg = async () => {
		if (!canvas) {
			showErr("Cannot generate QR code without canvas data.");
			return;
		}

		const { data: imgBlob, err } = await QRUtils.genImgBlob(canvas);
		// err handling
		if (err || !imgBlob) {
			showErr("Failed to generate QR code: " + err);
			return;
		}

		// open it in a new tab
		window.open(URL.createObjectURL(imgBlob));
	};

	const saveImg = async () => {
		if (!canvas) {
			showErr("Cannot generate QR code without canvas data.");
			return;
		}

		const { data: imgBlob, err } = await QRUtils.genImgBlob(canvas);
		// err handling
		if (err || !imgBlob) {
			showErr("Failed to generate QR code: " + err);
			return;
		}
		const qrImgDataURL = URL.createObjectURL(imgBlob);

		// save it to downloads
		saveAnchor.href = qrImgDataURL;
		saveAnchor.target = "_blank";
		saveAnchor.download = "Canvas QR Code.png";
		saveAnchor.click(); // trigger save
	};

	const genPDF = async () => {
		if (!canvas) {
			showErr("Cannot generate PDF without canvas data.");
			return;
		}

		const { data: pdfBlob, err } = await QRUtils.genPDFBlob(canvas);
		// err handling
		if (err || !pdfBlob) {
			showErr("Failed to generate PDF: " + err);
			return;
		}

		// convert blob to URL and open in new window
		const pdfURL = URL.createObjectURL(pdfBlob);
		window.open(pdfURL, "_blank");
	};

	const savePDF = async () => {
		if (!canvas) return;
		const { data: pdfBlob, err } = await QRUtils.genPDFBlob(canvas);
		if (err || !pdfBlob) return;

		const pdfURL = URL.createObjectURL(pdfBlob);

		// iOS Safari always previews PDFs; it never honors `download` on blobs.
		const isIOS = /iP(hone|ad)/.test(navigator.userAgent);
		if (isIOS) {
			window.open(pdfURL, "_blank");
			return;
		}

		// other browsers will download
		saveAnchor.href = pdfURL;
		saveAnchor.target = "_blank";
		saveAnchor.download = "Canvas QR Code.pdf";
		saveAnchor.click();
	};

	// any error messages that pops up
	let errorStatus = $state({
		flag: false,
		message: ""
	});
	const showErr = (message: string) => {
		console.error(message);
		errorStatus.flag = true;
		errorStatus.message = message;
		open = true; // open modal if not already open
	};
</script>

<!-- Hidden anchors for saving qr codes -->
<section class="hidden">
	<a bind:this={saveAnchor}></a>
</section>

<main>
	<p>
		Here is where you can get the QR code for your canvases. Tap on a format you want and it'll
		open in a new tab.
	</p>

	<section class="cta" id="open">
		<button class="outline" onclick={genImg}>
			<Image s={28} />
			Image
		</button>
		<button class="outline" onclick={genPDF}>
			<Document s={28} />
			PDF
		</button>
	</section>

	<p>Or alternatively, download them directly.</p>

	<section class="cta" id="download">
		<button onclick={saveImg}> Download Image </button>
		<button onclick={savePDF}> Download PDF </button>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		display: flex;
		flex-direction: column;
		row-gap: 15px;

		width: 100%;
		height: 100%;

		margin-top: 20px;

		#qrcode-container {
			width: 100%;
			display: flex;
			justify-content: center;

			transition: transform 700ms $out-generic-expo;

			border-radius: 8px;
			overflow: hidden;

			#qrcode {
				width: 100%;
				max-width: 300px;
				height: auto;
				aspect-ratio: 1/1;

				border-radius: 8px;
			}

			&:active {
				transform: scale(0.9);

				@media screen and (min-width: $mobile-width) {
					transform: scale(1); // disable scaling on desktop
				}
			}
		}

		.cta {
			display: flex;
			width: 100%;
			gap: 10px;

			&#open {
				button {
					width: 100%;
					height: fit-content;

					display: flex;
					flex-direction: column;
					gap: 10px;

					padding: 20px;
				}
			}

			&#download {
				flex-direction: column;
			}
		}
	}

	.hidden {
		display: none;
		pointer-events: none;
	}
</style>
