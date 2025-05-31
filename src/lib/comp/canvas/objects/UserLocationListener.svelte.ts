import { checkNavigatorConfig, handleStatusError, haversineDistance } from "../utils/Geolocation";

// listens to user location, calculates if user is within the canvas, and also sets states (for distance and whether user is within the bounds)
export class UserLocationListener {
	private isCloseToCanvas: boolean = $state(false);
	private distance: number = $state(0);

	getIsCloseToCanvas() {
		return this.isCloseToCanvas;
	}
	setIsCloseToCanvas(bool: boolean) {
		this.isCloseToCanvas = bool;
	}

	getDistance() {
		return this.distance;
	}

	setDistance(dist: number) {
		this.distance = dist;
	}

	// checks that user is within canvas coordinates
	isWithinCanvas(userPosition: GeolocationPosition, canvasLat: number, canvasLon: number): boolean {
		const distanceBound: number = 20; // user must be within 20m of canvas

		const currDistance: number = haversineDistance(userPosition.coords.latitude, userPosition.coords.longitude, canvasLat, canvasLon);
		this.setDistance(currDistance);
		console.log(currDistance, "meters");
		console.log(userPosition.coords.latitude, userPosition.coords.longitude, canvasLat, canvasLon);

		return currDistance < distanceBound;
	}

	// setup listener for user coordinates that checks for user location with canvas 
	// changes state of whether or not user is close to canvas
	async setupListener(canvasLat: number, canvasLon: number) {
		const error: number = await checkNavigatorConfig(); // may return 0 or 1 if error, or -1 if no errors found

		if (error !== -1) {
			handleStatusError(error);
			this.setIsCloseToCanvas(false);
		} else {
			navigator.geolocation.watchPosition(
				(position) => {
					this.setIsCloseToCanvas(this.isWithinCanvas(position, canvasLat, canvasLon));
				}, 
				(error) => {
					handleStatusError(error.code);
					this.setIsCloseToCanvas(false);
				}, 
				{ enableHighAccuracy: true, timeout: Infinity, maximumAge: 0 });
		}
	}
}
