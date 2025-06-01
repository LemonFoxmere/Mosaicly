<script lang="ts">
	import jsPDF from "jspdf";
	import QRCode from "qrcode";
	import Document from "$lib/comp/ui/icons/Document.svelte";

	// QrSRC is the link to create QR code
	let { QrSRC = "", BackupCode = "", CanvasName = "" } = $props();

	// Call to generate a PDF if given a QrSRC, Backup code, and name of Canvas
	// QrSrc: link to page
	async function SaveToPDF(QrSrc: string, BackupCode: string, CanvasName: string) {
		// create a pdf file to fill out
		const doc = new jsPDF({
			orientation: "portrait",
			unit: "px",
			format: "letter"
		});
		// metadata properties
		doc.setProperties({
			title: "Mosaicly PDF",
			subject: "QR code PDF",
			author: "Mosaicly Team"
		});

		const PAGE_WIDTH = doc.internal.pageSize.width;
		const PAGE_HEIGHT = doc.internal.pageSize.height;

		// defining fonts for use in pdf
		doc.addFont("fonts/Outfit-Bold.ttf", "Outfit-Bold", "normal");
		doc.addFont("fonts/Outfit-Regular.ttf", "Outfit-Regular", "normal");

		// Adding QrCode image using dataURL, size is (PAGE_WIDTH / 2.2) x (PAGE_WIDTH / 2.2)
		// Note: qr-code is smaller than defined image size
		const QR_SIZE = PAGE_WIDTH / 2.2;
		doc.addImage(
			await QRCode.toDataURL(QrSRC),
			"JPEG", // file type (EX: JPEG, png)
			(PAGE_WIDTH - QR_SIZE) / 2,
			130,
			QR_SIZE,
			QR_SIZE
		);

		/* Adding text to pdf
		   Must set font and fontSize before text because it sets it for any upcoming text
		   Text is added after the image, because of layering, anything added after another is displayed on top */
		doc.setFont("Outfit-Bold", "normal")
			.setFontSize(30)
			.text("Like pixel art and shitposting?", PAGE_WIDTH / 2, 80, { align: "center" }); // displayed text, x, y, and options
		doc.setFont("Outfit-Regular", "normal") // Canvas Name
			.setFontSize(18)
			.setTextColor(146, 146, 146)
			.text(
				'Scan the QR code to start drawing on the "' + CanvasName + '" canvas',
				PAGE_WIDTH / 2,
				110,
				{
					align: "center", // text alignment
					maxWidth: PAGE_WIDTH * (2 / 3) // maxWidth sets "width of text box", used for text wrapping
				}
			);
		doc.setFont("Outfit-Regular", "normal")
			.setFontSize(18)
			.text(
				"Is the QR code broken? Go to mosaicly.io/search and type in the backup code:",
				PAGE_WIDTH / 2,
				380,
				{
					align: "center",
					maxWidth: PAGE_WIDTH * (2 / 3)
				}
			);
		doc.setFont("Outfit-Bold", "normal") // Backup Code
			.setFontSize(25)
			.setTextColor(0, 0, 0)
			.text(BackupCode, PAGE_WIDTH / 2, 430, {
				align: "center"
			});

		// company logo
		const img = new Image();
		img.src = "logos/logo-light-text.png";
		const imgWidth = 130;
		doc.addImage(img, "png", PAGE_WIDTH / 2 - imgWidth / 2, 540, imgWidth, 25);

		// EXPORTING created pdf
		// doc.save("qrcode.pdf"); // option 1: download pdf
		doc.output("dataurlnewwindow", { filename: "Mosaicly PDF" }); // option 2: open in new window
	}
</script>

<button class="outline" onclick={() => SaveToPDF(QrSRC, BackupCode, CanvasName)}>
	<Document s={22} />
	PDF
</button>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
</style>
