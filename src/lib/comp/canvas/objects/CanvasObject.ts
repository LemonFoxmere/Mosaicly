import type { SceneContext } from "../PixelCanvas.svelte";

export abstract class CanvasObject {
	id: string;
	x: number;
	y: number;
	scale: number;

	constructor(x: number, y: number, scale: number, id: string | null = null) {
		this.id = id || crypto.randomUUID();
		this.x = x;
		this.y = y;
		this.scale = scale;
	}

	abstract render(rctx: CanvasRenderingContext2D, sctx: SceneContext): void;

	abstract update(sctx: SceneContext): void;
	abstract onCursorMove(sctx: SceneContext): void;
	abstract onCursorDown(sctx: SceneContext): void;
	abstract onCursorUp(sctx: SceneContext): void;
}
