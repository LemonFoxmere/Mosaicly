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

	placePixel(cursorX: number, cursorY: number, color: string, sctx: SceneContext): void {
		if (!this.pixels) return;

		const halfGridCellCount = this.gridSize / 2;

		// Convert screen coordinates to centered world coordinates
		const worldCoordX = (cursorX - sctx.absx) / sctx.s;
		const worldCoordY = (cursorY - sctx.absy) / sctx.s;

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

		this.drawBackground(rctx, sctx, pixelDrawSize); // render the white background first

		for (const cellKey in this.pixels) {
			const [cellX, cellY] = cellKey.split(",").map(Number);
			const pixelData = this.pixels[cellKey];

			// Map cell coordinates to canvas coordinates
			const canvasX = cellX * pixelDrawSize;
			const canvasY = cellY * pixelDrawSize;

			rctx.fillStyle = pixelData.color;
			rctx.fillRect(
				Math.floor(canvasX) + sctx.absx - 0.5,
				Math.floor(canvasY) + sctx.absy - 0.5,
				pixelDrawSize + 1,
				pixelDrawSize + 1
			);
		}

		if (sctx.mode === "edit") {
			this.drawBrushPreview(rctx, sctx); // render the brush preview last
		}
	}

	private drawBackground(
		rctx: CanvasRenderingContext2D,
		sctx: SceneContext,
		pixelDrawSize: number
	): void {
		const fullGridDrawSize = this.gridSize * pixelDrawSize;

		rctx.fillStyle = "white";
		rctx.fillRect(
			sctx.absx - fullGridDrawSize / 2,
			sctx.absy - fullGridDrawSize / 2,
			fullGridDrawSize,
			fullGridDrawSize
		);
	}

	private drawBrushPreview(rctx: CanvasRenderingContext2D, sctx: SceneContext): void {
		const pixelDrawSize = this.pixelWorldSize * sctx.s;

		// Convert screen coordinates to centered world coordinates
		const worldCoordX = (sctx.cursor.relx - sctx.absx) / sctx.s;
		const worldCoordY = (sctx.cursor.rely - sctx.absy) / sctx.s;

		// calculate the matching cell coordinates
		const cellX = Math.floor(worldCoordX / this.pixelWorldSize);
		const cellY = Math.floor(worldCoordY / this.pixelWorldSize);

		// check if the cell is within bounds
		if (
			cellX < -this.gridSize / 2 ||
			cellX >= this.gridSize / 2 ||
			cellY < -this.gridSize / 2 ||
			cellY >= this.gridSize / 2
		)
			return;

		// draw the brush color
		rctx.fillStyle = sctx.pixelGrid.brush.color;
		rctx.fillRect(
			cellX * pixelDrawSize + 2 + sctx.absx,
			cellY * pixelDrawSize + 2 + sctx.absy,
			pixelDrawSize - 4,
			pixelDrawSize - 4
		);

		// draw a black and white border around the brush
		rctx.strokeStyle = "black";
		rctx.lineWidth = 2; // prevents half-pixel rendering
		rctx.strokeRect(
			cellX * pixelDrawSize + sctx.absx,
			cellY * pixelDrawSize + sctx.absy,
			pixelDrawSize,
			pixelDrawSize
		);
		rctx.strokeStyle = "white";
		rctx.lineWidth = 2;
		rctx.strokeRect(
			cellX * pixelDrawSize + 2 + sctx.absx,
			cellY * pixelDrawSize + 2 + sctx.absy,
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

		if (sctx.mode !== "edit") return;

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
