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
	abstract onMouseMove(sctx: SceneContext, e: MouseEvent): void;
	abstract onMouseDown(sctx: SceneContext, e: MouseEvent): void;
	abstract onMouseUp(sctx: SceneContext, e: MouseEvent): void;
}
