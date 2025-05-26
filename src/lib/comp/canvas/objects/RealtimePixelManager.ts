import type { RealtimeChannel } from "@supabase/supabase-js";
import type { PixelData } from "./PixelGrid.js";

// bruh
// class for managing realtime broadcast and database saving
export class RealtimePixelManager {
	private isDirty = false; // is the current pixel data stale?
	private pixelBroadcastQueue: Record<string, PixelData> = {}; // pixels that are to be broadcasted
	private pixelDatabaseQueue: Record<string, PixelData> = {}; // user's own pixels that are to be sent to the database (also used to hold "buffer" pixels)
	private canvasChannel: RealtimeChannel;

	private canvasID: string;
	private databaseTimeout: NodeJS.Timeout | undefined;

	constructor(canvasChannel: RealtimeChannel, canvasID: string) {
		this.canvasChannel = canvasChannel;
		this.canvasID = canvasID;
	}

	// setter for dirty flag
	setDirty(value: boolean): void {
		this.isDirty = value;
	}

	// queue pixels for broadcasting
	pushPixelBroadcastQueue(cellKey: string, pixels: Record<string, PixelData>): void {
		this.pixelBroadcastQueue[cellKey] = pixels[cellKey];
	}

	// queue pixels for sending to the database (cellKey selects one pixel from the pixelGrid)
	// this is also used as a "buffer" for when postgres changes come in to the canvas, preventing overwrites from happening
	pushPixelDatabaseQueue(cellKey: string, pixels: Record<string, PixelData>): void {
		this.pixelDatabaseQueue[cellKey] = pixels[cellKey];
	}

	getPixelDatabaseQueue(): Record<string, PixelData> {
		return this.pixelDatabaseQueue;
	}

	clearPixelDatabaseQueue(): void {
		Object.keys(this.pixelDatabaseQueue).map((cellKey) => {
			delete this.pixelDatabaseQueue[cellKey];
		});
	}

	// delete timer for sending canvas to the database (this will be called right before queueing another pixel)
	clearDatabaseTimer(): void {
		clearTimeout(this.databaseTimeout);
	}

	// fetch request to send pixels to database
	saveToDatabase(pixels: Record<string, PixelData>): void {
		// takes a "snapshot" of what pixels will be sent to the database
		const current: Record<string, PixelData> = Object.assign({}, this.pixelDatabaseQueue);
		fetch("/api/canvas", {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				canvasID: this.canvasID,
				drawing: pixels
			})
		}).then((response) => {
			void response;
			// TODO: error handling and possibly UI text for successful save?
		});

		// dequeue pixels that have been sent to the database
		Object.keys(current).map((cellKey) => {
			delete this.pixelDatabaseQueue[cellKey];
		});
	}

	// broadcasts pixel changes and eventually saves the whole canvas
	broadcastThenSave(pixels: Record<string, PixelData>): void {
		if (this.isDirty && Object.keys(this.pixelBroadcastQueue).length > 0) {
			// console.log("fuck");

			// takes a "snapshot" of what pixels will be broadcasted
			const current: Record<string, PixelData> = Object.assign({}, this.pixelBroadcastQueue);

			// delete the soon-to-be-broadcasted pixels from the queue
			Object.keys(current).map((cellKey) => {
				delete this.pixelBroadcastQueue[cellKey];
			});

			this.canvasChannel
				.send({
					type: "broadcast",
					event: "sync",
					payload: {
						pixels: current
					}
				})
				.then(() => {
					// check if there are any pixels to update before beginning database sending
					if (Object.keys(this.pixelBroadcastQueue).length == 0) {
						this.isDirty = false;

						// if nothing waiting, start readying for the canvas sending (1 second debounce)
						this.clearDatabaseTimer();
						// this.databaseTimeout = setTimeout(async () => this.saveToDatabase(pixels), 1000);
						this.saveToDatabase(pixels);
					}
				});
		}
	}
}
