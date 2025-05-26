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

		// directly setting coordiates of elements
		doc.setFont("Helvetica", "bold")
			.setFontSize(30)
			.text("Like pixel art and shitposting?", pageWidth / 2, 90, { align: "center" });
		doc.setFont("Helvetica", "normal")
			.setFontSize(18)
			.setTextColor(146, 146, 146)
			.text("Scan the QR code to start drawing on the X canvas", pageWidth / 2, 120, {
				align: "center"
			});

		// qr-code is smaller than image size
		doc.addImage(
			await QRCode.toDataURL(QrSRC),
			"JPEG",
			pageWidth / 4,
			130,
			pageWidth / 2,
			pageWidth / 2
		);
		doc.setFont("Helvetica", "normal")
			.setFontSize(18)
			.text(
				"Is the QR code broken? Go to mosaicly.io/search and type in the\nbackup code:",
				pageWidth / 2,
				380,
				{
					align: "center"
				}
			);
		doc.setFont("Helvetica", "bold")
			.setFontSize(25)
			.setTextColor(0, 0, 0)
			.text("XXXX-XXXX-XXXX", pageWidth / 2, 430, {
				align: "center"
			});
		doc.setFont("Helvetica", "bold")
			.setFontSize(20)
			.text("[] mosaicly", pageWidth / 2, 520, {
				align: "center"
			});
		doc.save("qrcode.pdf");
	}
</script>

<button onclick={SaveToPDF}> PDF </button>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
</style>
