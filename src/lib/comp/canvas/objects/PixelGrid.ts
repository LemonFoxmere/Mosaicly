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

	private offscreenCanvas: HTMLCanvasElement;
	private offscreenCtx: CanvasRenderingContext2D;
	private imageBuffer: ImageData;

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

		this.offscreenCanvas = document.createElement("canvas");
		this.offscreenCanvas.width = this.gridSize;
		this.offscreenCanvas.height = this.gridSize;
		const ctx = this.offscreenCanvas.getContext("2d");
		if (!ctx) throw new Error("Cannot initialize offscreen canvas");
		this.offscreenCtx = ctx;
		this.imageBuffer = this.offscreenCtx.createImageData(this.gridSize, this.gridSize);

		// initialize buffer to white background
		for (let i = 0; i < this.imageBuffer.data.length; i += 4) {
			this.imageBuffer.data[i + 0] = 255;
			this.imageBuffer.data[i + 1] = 255;
			this.imageBuffer.data[i + 2] = 255;
			this.imageBuffer.data[i + 3] = 255;
		}
		this.offscreenCtx.putImageData(this.imageBuffer, 0, 0);
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

		// update offscreen ImageData buffer
		const half = this.gridSize / 2;
		const bufferX = cellX + half;
		const bufferY = cellY + half;
		if (bufferX < 0 || bufferX >= this.gridSize || bufferY < 0 || bufferY >= this.gridSize) {
			return;
		}
		const idx = (bufferY * this.gridSize + bufferX) * 4;
		const hex = this.pixels[cellKey].color;
		const r = parseInt(hex.substr(1, 2), 16);
		const g = parseInt(hex.substr(3, 2), 16);
		const b = parseInt(hex.substr(5, 2), 16);
		this.imageBuffer.data[idx + 0] = r;
		this.imageBuffer.data[idx + 1] = g;
		this.imageBuffer.data[idx + 2] = b;
		this.imageBuffer.data[idx + 3] = 255;
		this.offscreenCtx.putImageData(this.imageBuffer, 0, 0);
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

		const fullGridDrawSize = this.gridSize * pixelDrawSize;
		rctx.drawImage(
			this.offscreenCanvas,
			Math.floor(sctx.absx - fullGridDrawSize / 2),
			Math.floor(sctx.absy - fullGridDrawSize / 2),
			Math.ceil(fullGridDrawSize),
			Math.ceil(fullGridDrawSize)
		);

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
			Math.floor(sctx.absx - fullGridDrawSize / 2),
			Math.floor(sctx.absy - fullGridDrawSize / 2),
			Math.ceil(fullGridDrawSize),
			Math.ceil(fullGridDrawSize)
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
			Math.floor(cellX * pixelDrawSize + 2 + sctx.absx),
			Math.floor(cellY * pixelDrawSize + 2 + sctx.absy),
			Math.ceil(pixelDrawSize - 4),
			Math.ceil(pixelDrawSize - 4)
		);

		// draw a black and white border around the brush
		rctx.strokeStyle = "black";
		rctx.lineWidth = 2; // prevents half-pixel rendering
		rctx.strokeRect(
			Math.floor(cellX * pixelDrawSize + sctx.absx),
			Math.floor(cellY * pixelDrawSize + sctx.absy),
			Math.ceil(pixelDrawSize),
			Math.ceil(pixelDrawSize)
		);
		rctx.strokeStyle = "white";
		rctx.lineWidth = 2;
		rctx.strokeRect(
			Math.floor(cellX * pixelDrawSize + 2 + sctx.absx),
			Math.floor(cellY * pixelDrawSize + 2 + sctx.absy),
			Math.ceil(pixelDrawSize - 4),
			Math.ceil(pixelDrawSize - 4)
		);
	}

	update(sctx: SceneContext): void {}

	onMouseDown(sctx: SceneContext, e: MouseEvent): void {
		this.onMouseMove(sctx, e);
	}
	onMouseMove(sctx: SceneContext, e: MouseEvent): void {
		void e;

		if (sctx.mode !== "edit" || sctx.cursor.rightActive) return;

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
		sctx.pixelGrid.brush.active = false;
	}
}
