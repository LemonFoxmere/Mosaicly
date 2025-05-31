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
		// if not OK
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
		// this should never execute.
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
