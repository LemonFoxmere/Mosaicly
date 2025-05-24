type Coordinates = { latitude: number; longitude: number; accuracy: number };

type GetCurrentPosResult = {
	location: GeolocationPosition | null;
	status: number;
};

const getCurrentPos = async (): Promise<GetCurrentPosResult> => {
	if (!("geolocation" in navigator)) {
		return { location: null, status: 2 };
	}

	if ("permissions" in navigator) {
		try {
			const { state } = await navigator.permissions.query({ name: "geolocation" });
			if (state === "denied") {
				return { location: null, status: 1 };
			}
		} catch {
			// ignore and proceed
		}
	}

	return new Promise<GetCurrentPosResult>((resolve) => {
		navigator.geolocation.getCurrentPosition(
			(position) => resolve({ location: position, status: 0 }),
			(error) => resolve({ location: null, status: error.code }),
			{ enableHighAccuracy: true, timeout: 2000, maximumAge: 0 }
		);
	});
};

export const fetchCoordinatesForDisplay = async (): Promise<{
	location: Coordinates | null;
	status: number;
}> => {
	const { location, status } = await getCurrentPos();

	if (status !== 0) {
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
		return {
			location: null,
			status: status
		};
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

export const isDisplayableMapCoordinate = (lat?: number, long?: number): boolean => {
	return typeof lat === "number" && typeof long === "number" && lat !== 0 && long !== 0;
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
