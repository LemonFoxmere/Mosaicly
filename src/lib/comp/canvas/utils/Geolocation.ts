type Coordinates = { latitude: number; longitude: number; accuracy: number };

type GetCurrentPosResult = {
	location: GeolocationPosition | null;
	status: number;
};

// checks geolocation and permissions from user's browser and returns error number if needed
export const checkNavigatorConfig = async (): Promise<number> => {
	if (!("geolocation" in navigator)) {
		return 2; // error: 2
	}

	if ("permissions" in navigator) {
		try {
			const { state } = await navigator.permissions.query({ name: "geolocation" });
			if (state === "denied") {
				return 1; // status: 1
			}
		} catch {
			// ignore and proceed
		}
	}

	return -1; // -1 if no errors found
}

const getCurrentPos = async (): Promise<GetCurrentPosResult> => {

	// check that user has the correct geolocation configurations
	const error: number = await checkNavigatorConfig(); // may return 0 or 1 if error, or -1 if no errors found
	if (error !== -1) {
		return { location: null, status: error }
	}

	// otherwise, get current location
	return new Promise<GetCurrentPosResult>((resolve) => {
		navigator.geolocation.getCurrentPosition(
			(position) => resolve({ location: position, status: 0 }),
			(error) => resolve({ location: null, status: error.code }),
			{ enableHighAccuracy: true, timeout: 2000, maximumAge: 0 }
		);
	});
};

// error handling for when status is not 0
const handleStatusError = (status: number) => {
	switch (status) {
		case GeolocationPositionError.PERMISSION_DENIED:
			alert("Location access was denied. Enable it in your browser settings.");
			break;
		case GeolocationPositionError.POSITION_UNAVAILABLE:
			alert(
				"Location access unavailable. Are you on a device that supports geolocation?"
			);
			break;
		case GeolocationPositionError.TIMEOUT:
			alert("Location access timed out. Try again in a bit.");
			break;
		default:
			alert("Idk what happened but something is very wrong. Please try again later.");
	}
}

export const fetchCoordinatesForDisplay = async (): Promise<{
	location: Coordinates | null;
	status: number;
}> => {
	const { location, status } = await getCurrentPos();

	if (status !== 0) {
		handleStatusError(status);
		return { location: null, status: status}
	}

	if (location) {
		return {
			location: {
				latitude: roundCoordinate(location.coords.latitude),
				longitude: roundCoordinate(location.coords.longitude),
				accuracy: location.coords.accuracy
			},
			status: 0
		};
	} else {
		return {
			location: null,
			status: status
		};
	}
};

export const roundCoordinate = (num: number, decimalPlaces: number = 7): number => {
	if (isNaN(num) || !isFinite(num)) return num;
	const factor = Math.pow(10, decimalPlaces);
	return Math.round(num * factor) / factor;
};

export const isDisplayableMapCoordinate = (lat?: number, lng?: number): boolean => {
	return (
		typeof lat === "number" &&
		typeof lng === "number" &&
		!isNaN(lat) &&
		!isNaN(lng) &&
		lat !== 0 &&
		lng !== 0
	);
};

export const parseCoordinateString = (
	coordString: string
): { latitude: number; longitude: number; isValid: boolean } => {
	if (!coordString || coordString.trim() === "") {
		return { latitude: NaN, longitude: NaN, isValid: false };
	}

	const parts = coordString.trim().split(",");
	if (parts.length !== 2) {
		return { latitude: NaN, longitude: NaN, isValid: false };
	}

	const [latStr, longStr] = parts.map((s) => s.trim());
	const latitude = Number(latStr);
	const longitude = Number(longStr);

	const isValid =
		isFinite(latitude) &&
		isFinite(longitude) &&
		Math.abs(latitude) <= 90 &&
		Math.abs(longitude) <= 180;

	return { latitude, longitude, isValid };
};

export const formatCoordinateString = (latitude: number, longitude: number): string => {
	if (!isFinite(latitude) || !isFinite(longitude)) {
		return "";
	}
	return `${roundCoordinate(latitude)}, ${roundCoordinate(longitude)}`;
};

export const areCoordinatesEqual = (
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number
): boolean => {
	return (
		roundCoordinate(lat1) === roundCoordinate(lat2) &&
		roundCoordinate(lng1) === roundCoordinate(lng2)
	);
};

export const validateCoordinates = (
	latitude: number,
	longitude: number,
	options?: {
		allowDefault?: boolean;
		defaultCoords?: { lat: number; lng: number };
	}
): { isValid: boolean; reason?: string } => {
	const { allowDefault = false, defaultCoords = { lat: 0, lng: 0 } } = options || {};

	if (!isDisplayableMapCoordinate(latitude, longitude)) {
		return { isValid: false, reason: "Invalid coordinate values" };
	}

	if (
		!allowDefault &&
		areCoordinatesEqual(latitude, longitude, defaultCoords.lat, defaultCoords.lng)
	) {
		return { isValid: false, reason: "Coordinates cannot be default location" };
	}

	return { isValid: true };
};

// helper function to return distance (in meters) between two latitude-longitude locations
// adapted from talkol in Stack Overflow: https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
const haversineDistance = (lat1Degrees: number, lon1Degrees: number, lat2Degrees: number, lon2Degrees: number) => {
    const degreesToRad = (degree : number) => degree * Math.PI / 180;
    
    const lat1 = degreesToRad(lat1Degrees);
    const lon1 = degreesToRad(lon1Degrees);
    const lat2 = degreesToRad(lat2Degrees);
    const lon2 = degreesToRad(lon2Degrees);
    
    const { sin, cos, sqrt, asin } = Math;
    
    const earthRadiusMeters = 6378137; // earth radius in km (WGS84)
    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;
    const a = sin(deltaLat / 2) * sin(deltaLat / 2)
            + cos(lat1) * cos(lat2)
            * sin(deltaLon / 2) * sin(deltaLon / 2);
    const c = 2 * asin(sqrt(a));
    const distance = earthRadiusMeters * c;
    return distance; // distance in m
}

// checks that user is within canvas coordinates
const isWithinCanvas = (userLocationInfo: UserLocationInfo, userPosition: GeolocationPosition, canvasLat: number, canvasLon: number): boolean => {
	const distanceBound: number = 20; // user must be within 20m of canvas

	const currDistance: number = haversineDistance(userPosition.coords.latitude, userPosition.coords.longitude, canvasLat, canvasLon);
	userLocationInfo.setDistance(currDistance);
	console.log(currDistance, "meters");
	console.log(userPosition.coords.latitude, userPosition.coords.longitude, canvasLat, canvasLon);

	return currDistance < distanceBound;
	// let coord: number[] = [currDistance, userPosition.coords.latitude, userPosition.coords.longitude, canvasLat, canvasLon]
	// return coord.toString();
}

export class UserLocationInfo {
	isCloseToCanvas: boolean = false;
	distance: number = 0;

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
}

// setup listener for user coordinates that checks for user location with canvas 
// changes state of whether or not user is close to canvas
export const setupListener = async (userLocationInfo: UserLocationInfo, canvasLat: number, canvasLon: number) => {
	const error: number = await checkNavigatorConfig(); // may return 0 or 1 if error, or -1 if no errors found
	userLocationInfo.setIsCloseToCanvas(true);
	if (error !== -1) {
		handleStatusError(error);
		userLocationInfo.setIsCloseToCanvas(false);
	} else {

		navigator.geolocation.watchPosition(
			(position) => {
				// isCloseToCanvas(isWithinCanvas(position, canvasLat, canvasLon))
				console.log(position)
				userLocationInfo.setIsCloseToCanvas(isWithinCanvas(userLocationInfo, position, canvasLat, canvasLon));
			}, 
			(error) => {
				// handleStatusError(error.code);
				console.log(error.code)
				userLocationInfo.setIsCloseToCanvas(false);
			}, 
			{ enableHighAccuracy: true, timeout: Infinity, maximumAge: 0 });
	}
}