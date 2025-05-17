type Coordinates = { latitude: number; longitude: number; accuracy: number };
let cachedCoords: Coordinates | null = null;

const getCurrentPos = (): Promise<GeolocationPosition> =>
	new Promise((resolve, reject) =>
		navigator.geolocation.getCurrentPosition(resolve, reject, {
			enableHighAccuracy: true,
			timeout: 2000,
			maximumAge: 0
		})
	);

const requestGeolocationPermission = async (): Promise<boolean> => {
	if (!navigator.permissions) return true;
	try {
		const status = await navigator.permissions.query({ name: "geolocation" });
		if (status.state === "denied") {
			alert("Location access has been denied. Please enable it in your browser settings.");
			return false;
		}
		return true;
	} catch {
		return true;
	}
};

const ensureGeolocationReady = async (): Promise<boolean> => {
	if (!navigator.geolocation) {
		alert("Geolocation is not supported by your browser.");
		return false;
	}
	return requestGeolocationPermission();
};

const isGeoError = (error: any): error is { code: number; message: string } =>
	error && typeof error.code === "number" && typeof error.message === "string";

const handleGeolocationError = (error: any): void => {
	if (isGeoError(error) && error.code === 1) {
		alert("Location access was denied. Please enable it in your browser settings.");
	}
};

export const fetchCoordinatesForDisplay = async (): Promise<Coordinates | null> => {
	if (!(await ensureGeolocationReady())) return null;

	try {
		const position = await getCurrentPos();
		const coords = {
			latitude: roundCoordinate(position.coords.latitude),
			longitude: roundCoordinate(position.coords.longitude),
			accuracy: position.coords.accuracy
		};
		cachedCoords = coords;

		// try to get a more accurate position in the background
		setTimeout(async () => {
			try {
				const betterPosition = await getCurrentPos();
				if (betterPosition.coords.accuracy < coords.accuracy) {
					cachedCoords = {
						latitude: roundCoordinate(betterPosition.coords.latitude),
						longitude: roundCoordinate(betterPosition.coords.longitude),
						accuracy: betterPosition.coords.accuracy
					};
				}
			} catch {
				// silently fail - we already have initial coordinates
			}
		}, 1000);

		return coords;
	} catch (error) {
		handleGeolocationError(error);
		return null;
	}
};

export const roundCoordinate = (num: number, decimalPlaces: number = 7): number => {
	if (isNaN(num) || !isFinite(num)) return num;
	const factor = Math.pow(10, decimalPlaces);
	return Math.round(num * factor) / factor;
};

export const injectGeography = async ({ formData }: { formData: FormData }) => {
	const coords = await fetchCoordinatesForDisplay();
	if (!coords) return;
	formData.set("longitude", String(coords.longitude));
	formData.set("latitude", String(coords.latitude));
	formData.set("accuracy", String(coords.accuracy));
};
