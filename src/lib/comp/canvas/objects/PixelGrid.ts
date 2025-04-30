import type { SceneContext } from "../PixelCanvas.svelte";
import { CanvasObject } from "./CanvasObject";

// Structure for storing pixel information
export type PixelData = {
	color: string;
	lastedEditedUserID: string | null;
	lastedEditedName: string | null;
	lastedEditedTime: Date | null;
};

/**
 * PixelGrid: manages a grid of pixels in a virtual world.
 * pixelWorldSize: size of one cell in real pixel-space units.
 * World coordinates: origin at center of grid.
 * Cells: discrete grid cells addressed by (cellX, cellY).
 */
export class PixelGrid extends CanvasObject {
	// key = "cellX,cellY", value = PixelData
	pixels: Record<string, PixelData> = {};
	gridSize = 256; // number of cells in one dimension
	pixelWorldSize = 1; // how big a virtual pixel should be in real pixel-space units at zoom = 1

	constructor(
		x: number,
		y: number,
		gridSize: number,
		pixelWorldSize: number,
		scale: number,
		id: string | null = null
	) {
		super(x, y, scale, id);
		this.gridSize = gridSize;
		this.pixelWorldSize = pixelWorldSize;
		this.pixels = {};
	}

	// Merge or create pixel at given cell coordinates
	addOrUpdatePixel(cellX: number, cellY: number, data: Partial<PixelData>) {
		const cellKey = `${cellX},${cellY}`;
		const now = new Date();
		const existing = this.pixels[cellKey] || {};
		this.pixels[cellKey] = {
			...existing,
			...data,
			lastedEditedTime: now,
			lastedEditedUserID: data.lastedEditedUserID ?? existing.lastedEditedUserID ?? null,
			lastedEditedName: data.lastedEditedName ?? existing.lastedEditedName ?? null
		};
	}

	placePixel(targetX: number, targetY: number, color: string, sctx: SceneContext): void {
		if (!this.pixels) return;

		const fullGridPixelSize = this.gridSize * this.pixelWorldSize;
		const halfGridPixelSize = fullGridPixelSize / 2;
		const halfGridCellCount = this.gridSize / 2;

		// Convert screen coordinates to centered world coordinates
		const worldCoordX = targetX / sctx.s - halfGridPixelSize;
		const worldCoordY = targetY / sctx.s - halfGridPixelSize;

		// Determine which cell in the grid
		const cellX = Math.floor(worldCoordX / this.pixelWorldSize);
		const cellY = Math.floor(worldCoordY / this.pixelWorldSize);

		const withinBounds =
			cellX >= -halfGridCellCount &&
			cellX < halfGridCellCount &&
			cellY >= -halfGridCellCount &&
			cellY < halfGridCellCount;

		if (withinBounds) {
			const cellKey = `${cellX},${cellY}`;
			const existingPixel = this.pixels[cellKey];
			const isNewPixel = !existingPixel;
			const needsUpdate = isNewPixel || existingPixel.color !== color;

			if (needsUpdate) {
				this.addOrUpdatePixel(cellX, cellY, {
					color,
					lastedEditedUserID: null,
					lastedEditedName: null
				});
			}
		}
	}

	render(rctx: CanvasRenderingContext2D, sctx: SceneContext): void {
		const pixelDrawSize = this.pixelWorldSize * sctx.s;
		const halfGridCellCount = this.gridSize / 2;

		this.drawBackground(rctx, pixelDrawSize); // render the white background first

		for (const cellKey in this.pixels) {
			const [cellX, cellY] = cellKey.split(",").map(Number);
			const pixelData = this.pixels[cellKey];

			// Map cell coordinates to canvas coordinates
			const canvasX = (cellX + halfGridCellCount) * pixelDrawSize;
			const canvasY = (cellY + halfGridCellCount) * pixelDrawSize;

			rctx.fillStyle = pixelData.color;
			rctx.fillRect(Math.floor(canvasX), Math.floor(canvasY), pixelDrawSize, pixelDrawSize);
		}

		this.drawBrushPreview(rctx, sctx); // render the brush preview last
	}

	private drawBackground(rctx: CanvasRenderingContext2D, pixelDrawSize: number): void {
		const fullGridDrawSize = this.gridSize * pixelDrawSize;

		rctx.fillStyle = "white";
		rctx.fillRect(0, 0, fullGridDrawSize, fullGridDrawSize);
	}

	private drawBrushPreview(rctx: CanvasRenderingContext2D, sctx: SceneContext): void {
		const pixelDrawSize = this.pixelWorldSize * sctx.s;

		// calculate the matching cell coordinates
		const cellX = Math.floor(sctx.cursor.relx / sctx.s / this.pixelWorldSize); // snap to grid
		const cellY = Math.floor(sctx.cursor.rely / sctx.s / this.pixelWorldSize);

		// check if the cell is within bounds
		if (cellX < 0 || cellX >= this.gridSize || cellY < 0 || cellY >= this.gridSize) return;

		// draw a black and white border around the brush
		rctx.strokeStyle = "black";
		rctx.lineWidth = 2; // prevents half-pixel rendering
		rctx.strokeRect(
			cellX * pixelDrawSize + 1,
			cellY * pixelDrawSize + 1,
			pixelDrawSize - 2,
			pixelDrawSize - 2
		);
		rctx.strokeStyle = "white";
		rctx.lineWidth = 2;
		rctx.strokeRect(
			cellX * pixelDrawSize + 2,
			cellY * pixelDrawSize + 2,
			pixelDrawSize - 4,
			pixelDrawSize - 4
		);

		// draw the brush color
		rctx.fillStyle = sctx.pixelGrid.brush.color;
		rctx.fillRect(
			cellX * pixelDrawSize + 2,
			cellY * pixelDrawSize + 2,
			pixelDrawSize - 4,
			pixelDrawSize - 4
		);
	}

	update(sctx: SceneContext): void {
		void sctx;
	}

	onMouseDown(sctx: SceneContext, e: MouseEvent): void {
		this.onMouseMove(sctx, e);
	}
	onMouseMove(sctx: SceneContext, e: MouseEvent): void {
		void e;
		if (
			sctx.cursor.relx < 0 ||
			sctx.cursor.relx > sctx.width ||
			sctx.cursor.rely < 0 ||
			sctx.cursor.rely > sctx.height
		) {
			sctx.pixelGrid.brush.active = false;
			return;
		}

		sctx.pixelGrid.brush.active = sctx.cursor.active;
		if (this.pixels && sctx.s > 0 && sctx.pixelGrid.brush.active) {
			this.placePixel(sctx.cursor.relx, sctx.cursor.rely, sctx.pixelGrid.brush.color, sctx);
		}
	}
	onMouseUp(sctx: SceneContext, e: MouseEvent): void {
		void e;
		sctx.pixelGrid.brush.active = false;
	}
}
