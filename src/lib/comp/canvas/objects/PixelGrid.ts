import type { SceneContext } from "../PixelCanvas.svelte";
import { CanvasObject } from "./CanvasObject";
//added heavy documentation bcz i figure this is important

// Define the structure for pixel data
export type PixelData = {
	color: string;
	lastedEditedUserID: string | null; // Placeholder type
	lastedEditedName: string | null; // Placeholder type
	lastedEditedTime: Date | null; // Placeholder type
};

export class PixelGrid extends CanvasObject {
	// Using a Record (hashmap) to store pixel data: key="x,y", value=PixelData
	pixels: Record<string, PixelData> = {};

	gridSize = 256; // Total size (e.g., -128 to 127)
	pixelWorldSize = 1; // Set to 1 so grid units match world units

	constructor(x: number, y: number, scale: number, id: string | null = null) {
		super(x, y, scale, id);
	}

	// Method to add or update a pixel in the grid data
	addOrUpdatePixel(gridX: number, gridY: number, data: Partial<PixelData>) {
		const key = `${gridX},${gridY}`;
		const now = new Date();
		// merging existing data with new data, always updating time
		this.pixels[key] = {
			...this.pixels[key], // Keep existing data if any
			...data, // Apply new data (e.g., color)
			lastedEditedTime: now, // Always update time
			// Default placeholders if not provided
			lastedEditedUserID:
				data.lastedEditedUserID ?? (this.pixels[key]?.lastedEditedUserID || null),
			lastedEditedName: data.lastedEditedName ?? (this.pixels[key]?.lastedEditedName || null)
		};
	}

	draw(rctx: CanvasRenderingContext2D, sctx: SceneContext): void {
		// Calculate the size pixels should be drawn based on world size and current scene scale
		const pixelDrawSize = this.pixelWorldSize * sctx.s;
		const halfGrid = this.gridSize / 2;

		// Iterate through the stored pixels and draw them relative to the canvas origin (0,0)
		for (const key in this.pixels) {
			const [gridX, gridY] = key.split(",").map(Number);
			const pixelData = this.pixels[key];

			// Map grid coordinate [-halfGrid, halfGrid) to canvas coordinate [0, canvasSize)
			const canvasX = (gridX + halfGrid) * pixelDrawSize;
			const canvasY = (gridY + halfGrid) * pixelDrawSize;

			rctx.fillStyle = pixelData.color;
			// Use Math.floor for potentially sharper rendering at integer scales
			rctx.fillRect(Math.floor(canvasX), Math.floor(canvasY), pixelDrawSize, pixelDrawSize);
		}

		// Draw the grid boundary relative to the canvas origin (0,0)
		this.drawBoundary(rctx, sctx, pixelDrawSize);
	}

	private drawBoundary(
		rctx: CanvasRenderingContext2D,
		sctx: SceneContext,
		pixelDrawSize: number
	): void {
		// Boundary width in world pixels scaled to canvas pixels
		const boundaryDrawWidth = this.gridSize * pixelDrawSize;

		// calculating top-left corner relative to the canvas origin (0,0)
		// should correspond to to the logical grid coordinate (-halfGrid, -halfGrid)
		const boundaryX = 0; // (-halfGrid + halfGrid) * pixelDrawSize
		const boundaryY = 0; // (-halfGrid + halfGrid) * pixelDrawSize

		rctx.strokeStyle = "rgba(150, 150, 150, 0.7)"; // A slightly visible grey
		rctx.lineWidth = 1; // Keep it thin
		// Use Math.floor for potentially sharper rendering
		rctx.strokeRect(
			Math.floor(boundaryX),
			Math.floor(boundaryY),
			boundaryDrawWidth,
			boundaryDrawWidth
		);
	}

	update(sctx: SceneContext): void {
		// Future updates related to scale or position could go here
		// For now, scale is handled directly in draw based on sctx.s
	}

	// These methods are required by the abstract class but might not be needed
	// if interaction is handled solely in PixelCanvas.svelte
	onMouseMove(e: MouseEvent): void {}
	onMouseDown(e: MouseEvent): void {}
	onMouseUp(e: MouseEvent): void {}
}
