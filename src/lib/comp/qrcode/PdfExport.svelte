<script lang="ts">
	import jsPDF from "jspdf";
	import QRCode from "qrcode";

	// QrSRC is the link to create QR code
	let { QrSRC = "", BackupCode = "", CanvasName = "*name of canvas*" } = $props();

	async function SaveToPDF() {
		const doc = new jsPDF({
			orientation: "portrait",
			unit: "px",
			format: "letter"
		});
		doc.setProperties({
			title: "Mosaicly PDF",
			subject: "QR code PDF",
			author: "Mosaicly Team"
		});

		const pageWidth = doc.internal.pageSize.width;
		const pageHeight = doc.internal.pageSize.height;

		doc.addFont("fonts/Outfit-Bold.ttf", "Outfit-Bold", "normal");
		doc.addFont("fonts/Outfit-Regular.ttf", "Outfit-Regular", "normal");

		doc.setFont("Outfit-Bold", "normal")
			.setFontSize(30)
			.text("Like pixel art and shitposting?", pageWidth / 2, 80, { align: "center" });
		doc.setFont("Outfit-Regular", "normal")
			.setFontSize(18)
			.setTextColor(146, 146, 146)
			.text(
				"Scan the QR code to start drawing on the " + CanvasName + " canvas",
				pageWidth / 2,
				110,
				{
					align: "center",
					maxWidth: pageWidth * (2 / 3)
				}
			);

		// qr-code is smaller than image size
		doc.addImage(
			await QRCode.toDataURL(QrSRC),
			"JPEG",
			pageWidth / 4,
			130,
			pageWidth / 2,
			pageWidth / 2
		);

		doc.setFont("Outfit-Regular", "normal")
			.setFontSize(18)
			.text(
				"Is the QR code broken? Go to mosaicly.io/search and type in the backup code:",
				pageWidth / 2,
				380,
				{
					align: "center",
					maxWidth: pageWidth * (2 / 3)
				}
			);
		doc.setFont("Outfit-Bold", "normal") // Backup Code
			.setFontSize(25)
			.setTextColor(0, 0, 0)
			.text(BackupCode, pageWidth / 2, 430, {
				align: "center"
			});

		// logo
		const img = new Image();
		img.src = "logos/logo-light-text.png";
		const imgWidth = 130;
		doc.addImage(img, "png", pageWidth / 2 - imgWidth / 2, 540, imgWidth, 25);
		// doc.save("qrcode.pdf");	// download pdf
		doc.output("dataurlnewwindow", { filename: "Mosaicly PDF" }); // open in new window
	}
</script>

<button onclick={SaveToPDF}> PDF </button>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
</style>
