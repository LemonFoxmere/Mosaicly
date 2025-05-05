import type { SceneContext } from "../PixelCanvas.svelte";

export class CanvasUtils {
	/**
	 * Updates the canvas position (pan) based on deltas, while respecting world bounds.
	 * Ensures that panning does not move the view beyond the defined (x, y) boundaries.
	 *
	 * @param sctx - Scene context reference containing canvas state.
	 * @param dx - Change in x-position (e.g., from dragging).
	 * @param dy - Change in y-position.
	 */
	static updateCanvasXY(sctx: SceneContext, dx: number, dy: number) {
		if ((sctx.x + dx) / sctx.s < sctx.xBound[0]) {
			sctx.x = sctx.xBound[0] * sctx.s;
		} else if ((sctx.x + dx) / sctx.s > sctx.xBound[1]) {
			sctx.x = sctx.xBound[1] * sctx.s;
		} else {
			sctx.x += dx;
		}

		if ((sctx.y + dy) / sctx.s < sctx.yBound[0]) {
			sctx.y = sctx.yBound[0] * sctx.s;
		} else if ((sctx.y + dy) / sctx.s > sctx.yBound[1]) {
			sctx.y = sctx.yBound[1] * sctx.s;
		} else {
			sctx.y += dy;
		}
	}

	/**
	 * Converts a hex color string into an RGBA array.
	 *
	 * Accepts hex codes in any casing (e.g. "#ABC", "#abcdef", "abc123", etc.)
	 * and supports both shorthand (3 or 4 characters) and full-length (6 or 8 characters)
	 * formats, with or without an alpha channel.
	 *
	 * @param {string} hex - The hex color code, with or without a leading "#".
	 * @returns {[number, number, number, number]} An array representing the RGBA color,
	 *          where each value is in the range [0, 255] for RGB and [0, 1] for A.
	 * @throws {Error} If the input is not a valid 3/4/6/8-digit hex color code.
	 */
	static hexToRgba(hex: string): [number, number, number, number] {
		// Normalize input: remove hash, convert to lowercase
		hex = hex.replace(/^#/, "").toLowerCase();

		// Expand short form (#abc or #abcd) to full form
		if (hex.length === 3 || hex.length === 4) {
			hex = hex
				.split("")
				.map((c) => c + c)
				.join("");
		}

		if (hex.length !== 6 && hex.length !== 8) {
			throw new Error("Invalid hex format");
		}

		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;

		return [r, g, b, a];
	}
}
