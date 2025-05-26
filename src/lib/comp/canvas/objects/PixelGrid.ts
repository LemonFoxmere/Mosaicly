import type { SceneContext } from "../PixelCanvas.svelte";
import { CanvasUtils } from "../utils/CanvasUtils";
import { CursorUtils } from "../utils/CursorUtils";
import { CanvasObject } from "./CanvasObject";
import { RealtimePixelManager } from "./RealtimePixelManager";

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

	// used for when updating a pixel
	userDisplayName: string = "";
	userID: string = "";

	// realtime for the pixelgrid (for broadcasting and saving to Supabase)
	realtimeManager: RealtimePixelManager;

	private buffer = document.createElement("canvas"); // for buffered rendering
	private bufferCtx: CanvasRenderingContext2D;

	constructor(
		id: string | null = null,
		canvasCfg: {
			x: number;
			y: number;
			gridSize: number;
			pixelWorldSize: number;
			scale: number;
		},
		backendCfg: {
			userDisplayName: string;
			userID: string;
			realtimeManager: RealtimePixelManager;
		}
	) {
		super(canvasCfg.x, canvasCfg.y, canvasCfg.scale, id);
		this.gridSize = canvasCfg.gridSize;
		this.pixelWorldSize = canvasCfg.pixelWorldSize;
		this.pixels = {};

		this.buffer.width = this.gridSize;
		this.buffer.height = this.gridSize;
		this.bufferCtx = this.buffer.getContext("2d")!;

		this.userDisplayName = backendCfg.userDisplayName;
		this.userID = backendCfg.userID;
		this.realtimeManager = backendCfg.realtimeManager;
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
		this.realtimeManager.pushPixelBroadcastQueue(cellKey, this.pixels);
		this.realtimeManager.pushPixelDatabaseQueue(cellKey, this.pixels);
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
				this.realtimeManager.setDirty(true);
				this.addOrUpdatePixel(cellX, cellY, {
					color,
					lastedEditedUserID: this.userID,
					lastedEditedName: this.userDisplayName
				});
			}
		}
	}

	render(rctx: CanvasRenderingContext2D, sctx: SceneContext): void {
		const pixelDrawSize = this.pixelWorldSize * sctx.s;

		this.drawBackground(rctx, sctx, pixelDrawSize); // render the white background first

		this.drawPixels(rctx, sctx, pixelDrawSize);

		if (sctx.mode === "edit" && !sctx.cursor.touch.usingTouch) {
			this.drawBrushPreview(rctx, sctx); // render the brush preview last
		}
	}

	// updated drawPixels:
	private drawPixels(
		rctx: CanvasRenderingContext2D,
		sctx: SceneContext,
		pixelDrawSize: number
	): void {
		const canvasSize = this.gridSize;
		const scene = new Uint8ClampedArray(canvasSize * canvasSize * 4).fill(1);

		for (const cellKey in this.pixels) {
			let [cellX, cellY] = cellKey.split(",").map(Number);
			cellX += Math.floor(canvasSize / 2);
			cellY += Math.floor(canvasSize / 2);
			if (cellX < 0 || cellX >= canvasSize || cellY < 0 || cellY >= canvasSize) continue;

			const pixelData = this.pixels[cellKey];
			const [r, g, b, a] = CanvasUtils.hexToRgba(pixelData.color);
			const idx = (cellY * canvasSize + cellX) * 4;
			scene[idx] = r;
			scene[idx + 1] = g;
			scene[idx + 2] = b;
			scene[idx + 3] = Math.round(a * 255);
		}

		const imageData = new ImageData(scene, canvasSize, canvasSize);
		this.bufferCtx.putImageData(imageData, 0, 0);

		const half = Math.floor(canvasSize / 2) * pixelDrawSize;
		const dx = Math.floor(sctx.absx) - half;
		const dy = Math.floor(sctx.absy) - half;
		const size = canvasSize * pixelDrawSize;

		rctx.imageSmoothingEnabled = false; // use nearest neightbor instead of lerp
		rctx.drawImage(this.buffer, dx, dy, size, size);
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

	update(sctx: SceneContext): void {
		void sctx;
	}

	onCursorDown(sctx: SceneContext): void {
		if (sctx.cursor.touch.usingTouch && sctx.cursor.touch.touchPtCt === 1) {
			this.onCursorMove(sctx);
		} else if (!sctx.cursor.touch.usingTouch) {
			this.onCursorMove(sctx);
		}
	}
	onCursorMove(sctx: SceneContext): void {
		if (sctx.mode !== "edit" || sctx.cursor.secondaryActive) return;

		if (
			sctx.cursor.relx < 0 ||
			sctx.cursor.relx > sctx.width ||
			sctx.cursor.rely < 0 ||
			sctx.cursor.rely > sctx.height ||
			CursorUtils.getDist(
				sctx.cursor.x,
				sctx.cursor.y,
				sctx.cursor.touch.initX,
				sctx.cursor.touch.initY
			) < 5 // avoid accidental touch draw while zooming or panning
		) {
			sctx.pixelGrid.brush.active = false;
			return;
		}

		sctx.pixelGrid.brush.active = sctx.cursor.active;
		if (this.pixels && sctx.s > 0 && sctx.pixelGrid.brush.active) {
			this.placePixel(sctx.cursor.relx, sctx.cursor.rely, sctx.pixelGrid.brush.color, sctx);
		}
	}
	onCursorUp(sctx: SceneContext): void {
		if (
			sctx.cursor.touch.usingTouch &&
			sctx.cursor.touch.touchPtCt === 1 &&
			sctx.mode === "edit"
		) {
			this.placePixel(sctx.cursor.relx, sctx.cursor.rely, sctx.pixelGrid.brush.color, sctx);
		}

		this.realtimeManager.broadcastThenSave(this.pixels); // push any pending pixel changes to the server
		sctx.pixelGrid.brush.active = false;
	}
}
