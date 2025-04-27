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

	abstract draw(rctx: CanvasRenderingContext2D, sctx: SceneContext): void;

	abstract update(sctx: SceneContext): void;
	abstract onMouseMove(e: MouseEvent): void;
	abstract onMouseDown(e: MouseEvent): void;
	abstract onMouseUp(e: MouseEvent): void;
}
