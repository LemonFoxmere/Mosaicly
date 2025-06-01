import { BASE_URL } from "$lib/@const/dynamic.env";
import jsPDF from "jspdf";
import QRCode from "qrcode";

export class QRUtils {
	/**
	 * Convert a base64-encoded data URL into a Blob.
	 *
	 * @param dataURL - Data URL in the format "data:[<mediatype>][;base64],<data>".
	 * @returns Blob containing decoded binary data with the correct MIME type.
	 */
	static dataURLtoBlob(dataURL: string): Blob {
		const [header, base64] = dataURL.split(",");
		const match = header.match(/:(.*?);/);
		const contentType = match ? match[1] : "";
		const byteString = atob(base64);
		const arrayBuffer = new Uint8Array(byteString.length);
		for (let i = 0; i < byteString.length; i++) {
			arrayBuffer[i] = byteString.charCodeAt(i);
		}
		return new Blob([arrayBuffer], { type: contentType });
	}

	/**
	 * Generate PDF blob with QR code and instructions for a canvas.
	 *
	 * @param canvas - Canvas object containing `title` and `backupCode`. Must be non-null and have a valid `backupCode`.
	 * @returns faultyResponse<Blob | null> with `data` set to the generated PDF Blob on success (and `err` null), or `data` null and `err` containing an error message on failure.
	 */
	static async genPDFBlob(
		canvas: DB.Canvas | Partial<DB.Canvas>
	): Promise<faultyResponse<Blob | null>>;
	static async genPDFBlob(
		canvasBackupCode: string,
		title: string
	): Promise<faultyResponse<Blob | null>>;
	static async genPDFBlob(
		arg: DB.Canvas | Partial<DB.Canvas> | string,
		title?: string
	): Promise<faultyResponse<Blob | null>> {
		if (typeof arg === "string") {
			const blankCanvas: Partial<DB.Canvas> = { backupCode: arg };
			arg = blankCanvas; // use partial blank canvases over string
		}
		if (!arg || !arg.backupCode) {
			return { data: null, err: "Canvas data is missing or invalid." };
		}

		const backupCode = arg.backupCode;
		const canvasTitle = arg.title || title; // use title from arg if available, otherwise use provided title

		const fullPath = `${BASE_URL}/canvas?c=${backupCode}`;

		// get the QR code data URL
		const qrDataURL = await QRCode.toDataURL(fullPath, {
			scale: 30,
			type: "image/png"
		});

		// create a pdf file to fill out
		const doc = new jsPDF({
			orientation: "portrait",
			unit: "pt",
			format: "letter"
		});
		doc.setProperties({
			title: `QR Code for the ${canvasTitle} canvas`,
			subject: "QR code",
			author: "Mosaicly"
		});

		// document size setup
		const pageWidth = doc.internal.pageSize.width;
		const pageHeight = doc.internal.pageSize.height;
		const pagePadding = 64;
		const xCenter = pageWidth / 2;
		const yCenter = pageHeight / 2;

		// content param setups
		const qrGap = 32;

		// defining fonts for use in pdf
		doc.addFont("fonts/Outfit-Bold.ttf", "Outfit-Bold", "normal");
		doc.addFont("fonts/Outfit-Regular.ttf", "Outfit-Regular", "normal");

		// ==================================== RENDER MAIN CONTENT ====================================

		const mainContentOffsetY = -32;
		const mainContentOffsetX = 0;

		// QR CODE
		const qrCodeSize = 256; // 256pt
		const qrCodeHalfSize = qrCodeSize / 2;
		const qrCodeX = xCenter - qrCodeHalfSize + mainContentOffsetX;
		const qrCodeY = yCenter - qrCodeHalfSize + mainContentOffsetY;

		doc.addImage(
			qrDataURL,
			"PNG",
			qrCodeX,
			qrCodeY,
			qrCodeSize, // w
			qrCodeSize // h
		);

		// CALL TO ACTION
		const ctaFontSize = 16;
		const ctaX = xCenter + mainContentOffsetX;
		const ctaY = yCenter - qrCodeHalfSize - qrGap + mainContentOffsetY; // baseline 50px above qr
		doc.setFont("Outfit-Regular", "normal")
			.setFontSize(ctaFontSize)
			.setTextColor("#808080") // 50% grey
			.text(`Scan the QR code to start drawing on the "${canvasTitle}" canvas.`, ctaX, ctaY, {
				align: "center", // text alignment
				maxWidth: pageWidth - pagePadding * 2 // wrap
			});

		// TITLE
		const titleFontSize = 28;
		const titleX = xCenter + mainContentOffsetX;
		const titleY = ctaY - ctaFontSize * 2; // baseline one lineheight away from the topline of cta
		doc.setFont("Outfit-Bold", "normal")
			.setFontSize(titleFontSize)
			.setTextColor("#000000") // 100% grey
			.text("Like pixel art and shitposting?", titleX, titleY, { align: "center" });

		// ADDITIONAL INSTRUCTIONS
		const addInstrFontSize = 16;
		const addInstrX = xCenter + mainContentOffsetX;
		const addInstrY = yCenter + qrCodeHalfSize + addInstrFontSize + qrGap + mainContentOffsetY; // topline 50px below qr
		doc.setTextColor("#808080");
		doc.setFont("Outfit-Regular", "normal");
		doc.setFontSize(addInstrFontSize);

		const textParts = [
			{ text: "Is the QR code broken? Go to ", underline: false },
			{ text: "mosaicly.io/search", underline: true },
			{ text: " and type in the backup code:", underline: false }
		];

		const maxWidth = pageWidth - pagePadding * 2;
		const lineHeight = addInstrFontSize * 1.2;
		let cursorY = addInstrY;
		let currentLine: { text: string; underline: boolean }[] = [];
		let currentLineWidth = 0;

		for (const part of textParts) {
			const words = part.text.split(" ");
			for (let i = 0; i < words.length; i++) {
				const word = words[i];
				const space = i < words.length - 1 ? " " : "";
				const tokenText = word + space;
				const tokenWidth = doc.getTextWidth(tokenText);

				if (currentLineWidth + tokenWidth > maxWidth && currentLine.length > 0) {
					let xLine = addInstrX - currentLineWidth / 2;
					for (const token of currentLine) {
						doc.text(token.text, xLine, cursorY);
						if (token.underline) {
							const underlineY = cursorY + 1;
							doc.setDrawColor("#808080");
							doc.setLineWidth(1.5).line(
								xLine,
								underlineY + 1.5,
								xLine + doc.getTextWidth(token.text),
								underlineY + 1.5
							);
							doc.setLineWidth(0.2);
						}
						xLine += doc.getTextWidth(token.text);
					}
					cursorY += lineHeight;
					currentLine = [];
					currentLineWidth = 0;
				}

				currentLine.push({ text: tokenText, underline: part.underline });
				currentLineWidth += tokenWidth;
			}
		}

		if (currentLine.length > 0) {
			let xLine = addInstrX - currentLineWidth / 2;
			for (const token of currentLine) {
				doc.text(token.text, xLine, cursorY);
				if (token.underline) {
					const underlineY = cursorY + 1;
					doc.setLineWidth(0.5).line(
						xLine,
						underlineY,
						xLine + doc.getTextWidth(token.text),
						underlineY
					);
					doc.setLineWidth(0.2);
				}
				xLine += doc.getTextWidth(token.text);
			}
		}

		// BACKUP CODE
		const backupCodeFontSize = 16;
		const backupCodeX = xCenter + mainContentOffsetX;
		const backupCodeY = addInstrY + backupCodeFontSize * 2 + 30; // topline 30px below additional instructions
		doc.setFont("Outfit-Bold", "normal")
			.setFontSize(backupCodeFontSize)
			.setTextColor("#000000") // 100% grey
			.text(backupCode, backupCodeX, backupCodeY, {
				align: "center"
			});

		// LOGO
		const logo = new Image();
		logo.src = "logos/logo-light-text.png";
		const logoProps = doc.getImageProperties(logo);
		const logoAspect = logoProps.height / logoProps.width;

		const logoHeight = 16;
		const logoWidth = logoHeight / logoAspect;
		const logoX = xCenter - logoWidth / 2 + mainContentOffsetX;
		const logoY = pageHeight - logoHeight - 42; // 42pt from bottom

		doc.addImage(logo, "png", logoX, logoY, logoWidth, logoHeight);

		// EXPORTING created pdf
		const blobPDF = new Blob([doc.output("blob")], { type: "application/pdf" });

		// all OK
		return {
			data: blobPDF,
			err: null
		};
	}

	/**
	 * Generate a PNG Blob of a QR code for a given canvas or backup code.
	 *
	 * @param arg - Either a `DB.Canvas` or `Partial<DB.Canvas>` containing a valid `backupCode`, or a `string` representing the `backupCode`.
	 * @returns `faultyResponse<Blob | null>` with `data` set to the PNG Blob of the QR code on success, or `data` null and `err` with an error message on failure.
	 */
	static async genImgBlob(
		canvas: DB.Canvas | Partial<DB.Canvas>
	): Promise<faultyResponse<Blob | null>>;
	static async genImgBlob(canvasBackupCode: string): Promise<faultyResponse<Blob | null>>;
	static async genImgBlob(
		arg: DB.Canvas | Partial<DB.Canvas> | string
	): Promise<faultyResponse<Blob | null>> {
		if (typeof arg === "string") {
			const blankCanvas: Partial<DB.Canvas> = { backupCode: arg };
			arg = blankCanvas;
		}
		if (!arg || !arg.backupCode) {
			return { data: null, err: "Canvas data is missing or invalid." };
		}
		const fullPath = `${BASE_URL}/canvas?c=${arg.backupCode}`;
		const dataURL = await QRCode.toDataURL(fullPath, {
			scale: 30,
			type: "image/png"
		});
		const blob: Blob = QRUtils.dataURLtoBlob(dataURL);
		return { data: blob, err: null };
	}
}
