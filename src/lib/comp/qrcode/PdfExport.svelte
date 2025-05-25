<script lang="ts">
	import QRCode from "qrcode";
	import jsPDF from "jspdf";

	let { QrSRC = "" } = $props();

	async function SaveToPDF() {
		const doc = new jsPDF({
			orientation: "portrait",
			unit: "px",
			format: "letter"
		});
		const pageWidth = doc.internal.pageSize.width;
		const pageHeight = doc.internal.pageSize.height;

		doc.setFont("times", "bold")
			.setFontSize(30)
			.text("Like Pixel Art and Shitposting?", pageWidth / 2, 70, { align: "center" });
		doc.setFont("times", "normal")
			.setFontSize(18)
			.text("Scan the QR code to start drawing on the X canvas", pageWidth / 2, 90, {
				align: "center"
			});

		// qr-code is actually smaller than image size
		doc.addImage(
			await QRCode.toDataURL(QrSRC),
			"JPEG",
			pageWidth / 4,
			130,
			pageWidth / 2,
			pageWidth / 2
		);
		doc.setFont("times", "normal")
			.setFontSize(18)
			.text(
				"Is the QR code broken? Go to mosaicly.io/search\nand type in the backup code:",
				pageWidth / 2,
				400,
				{
					align: "center"
				}
			);
		doc.setFont("times", "bold")
			.setFontSize(18)
			.text("XXXX-XXXX-XXXX", pageWidth / 2, 440, {
				align: "center"
			});
		doc.setFont("times", "bold")
			.setFontSize(20)
			.text("Mosaicly: []", pageWidth / 2, 500, {
				align: "center"
			});
		doc.save("qrcode.pdf");
	}
</script>

<button onclick={SaveToPDF}> PDF </button>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
</style>
