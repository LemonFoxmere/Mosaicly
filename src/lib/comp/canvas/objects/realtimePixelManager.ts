import type { RealtimeChannel } from "@supabase/supabase-js";
import type { PixelData } from "./PixelGrid.js";

// class for managing realtime broadcast and database saving
export class realtimePixelManager {
	private isDirty = false; // is the current pixel data stale?
	private pixelQueue: Record<string, PixelData> = {}; // pixels that are to be broadcasted
	private canvasChannel: RealtimeChannel | null;

	private canvasID: string;
	private databaseTimeout: NodeJS.Timeout | undefined;

	constructor(canvasChannel: RealtimeChannel | null, canvasID: string) {
		this.canvasChannel = canvasChannel;
		this.canvasID = canvasID;
	}

	// setter for dirty flag
	setDirty(value: boolean) {
		this.isDirty = value;
	}

	// queue pixels for broadcasting
	pushPixelQueue(cellKey: string, pixels: Record<string, PixelData>) {
		this.pixelQueue[cellKey] = pixels[cellKey];
	}

	// delete timer for sending canvas to the database (this will be called right before queueing another pixel)
	clearDatabaseTimer() {
		clearTimeout(this.databaseTimeout);
	}

	// broadcasts pixel changes and eventually saves the whole canvas
	broadcastThenSave(pixels: Record<string, PixelData>) {
		if (this.isDirty && Object.keys(this.pixelQueue).length > 0) {
			const current: Record<string, PixelData> = this.pixelQueue;

			// TODO: handle null canvasChannel?
			this.canvasChannel
				?.send({
					type: "broadcast",
					event: "sync",
					payload: {
						pixels: this.pixelQueue
					}
				})
				.then(() => {
					// delete the broadcasted pixels from the queue
					Object.keys(current).map((cellKey) => {
						delete this.pixelQueue[cellKey];
					});

					// check if there are any pixels waiting to be broadcasted before stopping sending
					if (Object.keys(this.pixelQueue).length == 0) {
						this.isDirty = false;

						// if nothing waiting, start batching for the canvas sending (1 second)
						this.databaseTimeout = setTimeout(async () => {
							fetch("/api/canvas", {
								method: "POST",
								headers: {
									Accept: "application/json",
									"Content-Type": "application/json"
								},
								body: JSON.stringify({
									canvasID: this.canvasID,
									drawing: pixels
								})
							}).then((response) => {
								// TODO: error handling and possibly UI text for successful save?
							});
						}, 1000);
					}
				});
		}
	}
}
