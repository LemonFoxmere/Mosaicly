import { calculateDistanceBetweenCoordinates, checkNavigatorConfig, handleStatusError } from "../utils/Geolocation";

// listens to user location, calculates if user is within the canvas, and also sets states (for distance and whether user is within the bounds)
export class UserLocationListener {
	private canvasLatitude: number;
	private canvasLongitude: number;

	private distances: Array<number> = $state([]); // keeps track of list of distances (to take average of)
	private distanceBound: number = 20; // user must be within 20m of canvas (if you don't want to test for valid bounds, you can set this to Infinity)
	private distanceCountLimit: number = 5;

	private hasValidDistance = $derived(this.getDistance() !== Infinity); // does user have any recorded distances? (used for canvas edit access errors)
	private canvasEditAccess = $state<boolean>(false); // is user within the canvas with no errors?
	private showCanvasLocationWait = $derived<boolean>(!this.hasValidDistance) // has the user never arrived at canvas before and has no distance recorded?
	private showCanvasDistanceError = $derived<boolean>(!this.canvasEditAccess && this.hasValidDistance); // is user too far from the canvas with a valid distance?

	private listenerID: number | null = null;

	constructor (
		canvasLatitude: number,
		canvasLongitude: number
	) {
		this.canvasLatitude = canvasLatitude;
		this.canvasLongitude = canvasLongitude;
	}

	userHasCanvasEditAccess() {
		return this.canvasEditAccess;
	}

	// can be false if user is too far or if there is an error (also automatically sets view access if true)
	setUserEditAccess(bool: boolean) {
		this.canvasEditAccess = bool;
	}

	// used for telling the user to move closer to the canvas to edit (and has already been to the canvas before)
	userHasCanvasDistanceError() {
		return this.showCanvasDistanceError;
	}

	// used for when the user's location is not loading
	userHasCanvasLocationWait() {
		return this.showCanvasLocationWait;
	}

	// return average distance in list of distances
	getDistance() {

		// this conditional exists to prevent a type error "Reduce of empty array with no initial value"
		if (this.distances.length > 0)
			return this.distances.reduce((runningSum, next) => runningSum + next) / this.distances.length;
		else
			return Infinity; // indicates no distance has been recorded yet (e.g. location of user cannot be found)
	}

	// get rounded distance in feet (default is whole number)
	getRoundedDistanceInFeet(decimalPlaces: number = 0) {
		const meterDistance = this.getDistance();
		if (meterDistance !== Infinity) {
			const feetDistance = meterDistance * 3.28084 // meters to feet conversion
			const factor = Math.pow(10, decimalPlaces);
			return Math.round(feetDistance * factor) / factor;
		} else
			return Infinity;
	}

	// push distance to the list of distances (maintains at most 5 distances on default)
	pushDistance(dist: number) {
		if (this.distances.length === this.distanceCountLimit) {
			this.distances.splice(0, 1);
		}
		this.distances.push(dist);
	}

	// calculate spherical distance from canvas and add to list of distances
	pushDistanceFromCanvas(userLat: number, userLon: number, canvasLat: number, canvasLon: number) {

		const currDistance: number = calculateDistanceBetweenCoordinates(userLat, userLon, canvasLat, canvasLon);
		this.pushDistance(currDistance);
	}

	clearListener() {
		if (this.listenerID !== null) {
			navigator.geolocation.clearWatch(this.listenerID);
		}
	}

	// set up listener for user coordinates that checks for user location with canvas 
	// changes state of whether or not user is close to canvas
	async setupListener() {

		if (this.listenerID !== null) {
			this.clearListener();
		}

		// user location configuration error checking
		const error: number = await checkNavigatorConfig(); // may return 1 or 2 if error, or -1 if no errors found

		if (error !== -1) {
			handleStatusError(error);
			this.setUserEditAccess(false);
		} else {

			// setup listener
			// success: check position from canvas and update "closeness" accordingly
			// error: set "closeness" to false since user has problems with location
			this.listenerID = navigator.geolocation.watchPosition(
				(position) => {
					this.pushDistanceFromCanvas(position.coords.latitude, position.coords.longitude, this.canvasLatitude, this.canvasLongitude);
					this.setUserEditAccess(this.getDistance() <= this.distanceBound); // check if user is within the distance bound
				}, 
				(error) => {
					handleStatusError(error.code);
					this.setUserEditAccess(false);
				}, 
				{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
		}
	}
}
