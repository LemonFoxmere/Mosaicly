import { getContext, setContext } from "svelte";

type Canvas = {
	id: string;
	name: string;
	loc: string;
	createdOn: Date;
};

class Canvases {
	canvases = $state<Canvas[]>([]);

	constructor(initData: Canvas[]) {
		this.canvases = initData;
	}

	add(canvas: Canvas) {
		this.canvases.push(canvas);
	}

	remove(id: string) {
		this.canvases = this.canvases.filter((canvas) => canvas.id != id);
	}
}

const CANVAS_CTX = Symbol("canvas");

export function setCanvasState(initData: Canvas[]) {
	const canvasState = $state(initData);
	// const canvasState = new Canvases(initData)
	setContext(CANVAS_CTX, canvasState);
	return canvasState;
}

export function getCanvasState() {
	return getContext<Canvas[]>(CANVAS_CTX);
}
