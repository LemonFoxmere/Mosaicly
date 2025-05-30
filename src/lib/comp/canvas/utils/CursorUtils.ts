import type { SceneContext } from "../PixelCanvas.svelte";

export class CursorUtils {
	/**
	 * Checks if the (x, y) position is within the boundaries of a DOMRect.
	 *
	 * @param x - The x-coordinate (usually from a mouse or touch event).
	 * @param y - The y-coordinate.
	 * @param boundingRect - The bounding rectangle to compare against.
	 * @returns `true` if the point is inside the bounding box, `false` otherwise.
	 */
	static isWithinBound(x: number, y: number, boundingRect: DOMRect): boolean {
		return (
			x >= boundingRect.left &&
			x <= boundingRect.right &&
			y >= boundingRect.top &&
			y <= boundingRect.bottom
		);
	}

	/**
	 * Computes the average (x, y) position from a list of touch points.
	 * If a bounding rectangle is provided, only touch points within the bounds are considered.
	 *
	 * @param t - The TouchList from a touch event.
	 * @param boundingRect - Optional DOMRect used to filter out touches outside the canvas.
	 * @returns A tuple representing the average [x, y] position of the valid touches.
	 *          If no valid touches are found (e.g., all outside bounds), returns [NaN, NaN].
	 */
	static getAvgTouchPoint(t: TouchList, boundingRect?: DOMRect): [number, number, number] {
		let avgX = 0;
		let avgY = 0;
		let count = 0;

		for (let i = 0; i < t.length; i++) {
			const x = t[i].clientX;
			const y = t[i].clientY;
			if (boundingRect && !this.isWithinBound(x, y, boundingRect)) continue;
			avgX += x;
			avgY += y;
			count++;
		}

		if (count === 0) return [0, 0, 0];

		avgX /= count;
		avgY /= count;
		return [avgX, avgY, count];
	}

	// =================================== CURSOR LOCATION HANDLING SNIPPETS ===================================

	/**
	 * Initializes cursor position and resets velocity and inertia.
	 * Should be called when input is first engaged (e.g., mouse down or touch start).
	 *
	 * @param sctx - Scene context reference to update.
	 * @param x - Absolute x-coordinate of the cursor.
	 * @param y - Absolute y-coordinate of the cursor.
	 * @param parentRect - Bounding rect of the canvas for relative positioning.
	 */
	static captureCursor(sctx: SceneContext, x: number, y: number, parentRect: DOMRect): void {
		sctx.cursor.x = sctx.cursor.activeX = x;
		sctx.cursor.y = sctx.cursor.activeY = y;
		sctx.cursor.relx = x - parentRect.left;
		sctx.cursor.rely = y - parentRect.top;
		// reset velocity
		sctx.cursor.vx = 0;
		sctx.cursor.vy = 0;
		// reset inertia
		sctx.ix = 0;
		sctx.iy = 0;
	}

	/**
	 * Updates cursor position and computes relative coordinates.
	 * Should be called on each input move event to track deltas.
	 *
	 * @param sctx - Scene context reference to update.
	 * @param x - Current absolute x-coordinate of the cursor.
	 * @param y - Current absolute y-coordinate.
	 * @param parentRect - Bounding rect of the canvas for relative positioning.
	 */
	static stepCursor(sctx: SceneContext, x: number, y: number, parentRect: DOMRect): void {
		sctx.cursor.px = sctx.cursor.x;
		sctx.cursor.py = sctx.cursor.y;
		sctx.cursor.x = x;
		sctx.cursor.y = y;
		sctx.cursor.relx = sctx.cursor.x - parentRect.left;
		sctx.cursor.rely = sctx.cursor.y - parentRect.top;
	}

	/**
	 * Finalizes cursor position and clamps inertia values.
	 * Should be called on input release (e.g., mouse up or touch end).
	 *
	 * @param sctx - Scene context reference to update.
	 * @param x - Absolute x-coordinate where the input was released.
	 * @param y - Absolute y-coordinate where the input was released.
	 * @param parentRect - Bounding rect of the canvas for relative positioning.
	 */
	static releaseCursor(sctx: SceneContext, x: number, y: number, parentRect: DOMRect): void {
		sctx.cursor.x = sctx.cursor.activeX = x;
		sctx.cursor.y = sctx.cursor.activeY = y;
		sctx.cursor.relx = sctx.cursor.x - parentRect.left;
		sctx.cursor.rely = sctx.cursor.y - parentRect.top;
		// reset velocity (keep inertia for physics to do its work)
		sctx.cursor.vx = 0;
		sctx.cursor.vy = 0;
		sctx.ix = Math.max(-30, Math.min(30, sctx.ix));
		sctx.iy = Math.max(-30, Math.min(30, sctx.iy));
	}

	// =================================== MATH UTILS ===================================

	static getDist(x1: number, y1: number, x2: number, y2: number): number {
		return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5;
	}
}
