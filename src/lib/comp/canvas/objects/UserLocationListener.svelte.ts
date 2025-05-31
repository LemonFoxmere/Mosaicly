import { checkNavigatorConfig, handleStatusError, haversineDistance } from "../utils/Geolocation";

// listens to user location, calculates if user is within the canvas, and also sets states (for distance and whether user is within the bounds)
export class UserLocationListener {
	private isCloseToCanvas: boolean = $state(false);
	private distances: Array<number> = $state([]); // keeps track of list of distances (to take average of)
	private distanceBound: number = 20; // user must be within 20m of canvas

	getIsCloseToCanvas() {
		return this.isCloseToCanvas;
	}

	// can be false if user is too far or if there is an error
	setIsCloseToCanvas(bool: boolean) {
		this.isCloseToCanvas = bool;
	}

	// return average distance in list of distances
	getDistance() {

		// this conditional exists to prevent a type error "Reduce of empty array with no initial value"
		if (this.distances.length > 0)
			return this.distances.reduce((runningSum, next) => runningSum + next) / this.distances.length;
		else
			return Infinity
	}

	// push distance to the list of distances (maintains at most 5 distances)
	pushDistance(dist: number) {
		if (this.distances.length == 5) {
			this.distances.splice(0, 1);
		}
		this.distances.push(dist);
	}

	// push user distance from canvas
	pushDistanceFromCanvas(userLat: number, userLon: number, canvasLat: number, canvasLon: number) {

		// calculate distance from canvas and add to list of distances
		const currDistance: number = haversineDistance(userLat, userLon, canvasLat, canvasLon);
		this.pushDistance(currDistance);
	}

	// setup listener for user coordinates that checks for user location with canvas 
	// changes state of whether or not user is close to canvas
	async setupListener(canvasLat: number, canvasLon: number) {

		// user location configuration error checking
		const error: number = await checkNavigatorConfig(); // may return 1 or 2 if error, or -1 if no errors found

		if (error !== -1) {
			handleStatusError(error);
			this.setIsCloseToCanvas(false);
		} else {

			// setup listener
			// success: check position from canvas and update "closeness" accordingly
			// error: set "closeness" to false since user has problems with location
			navigator.geolocation.watchPosition(
				(position) => {
					this.pushDistanceFromCanvas(position.coords.latitude, position.coords.longitude, canvasLat, canvasLon);
					this.setIsCloseToCanvas(this.getDistance() <= this.distanceBound); // check if user is within the distance bound
				}, 
				(error) => {
					handleStatusError(error.code);
					this.setIsCloseToCanvas(false);
				}, 
				{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
		}
	}
}
