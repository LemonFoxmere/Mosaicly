let cachedCoords: { latitude: number; longitude: number; accuracy: number } | null = null;

const getCurrentPos = (): Promise<GeolocationPosition> => {
	return new Promise((resolve, reject) =>
		navigator.geolocation.getCurrentPosition(resolve, reject)
	);
};

const requestGeolocationPermission = async (): Promise<boolean> => {
	if (!navigator.permissions) {
		return true;
	}
	try {
		const status = await navigator.permissions.query({ name: "geolocation" });
		if (status.state === "denied") {
			console.error("Geolocation permission denied");
			alert("Location access has been denied. Please enable it in your browser settings.");
			return false;
		}
		return true;
	} catch (err) {
		console.warn("Permissions API error, proceeding to prompt for geolocation", err);
		return true;
	}
};

export const fetchCoordinatesForDisplay = async (): Promise<{
	latitude: number;
	longitude: number;
	accuracy: number;
} | null> => {
	if (cachedCoords) return cachedCoords; // i cache coords to avoid multiple permission prompts

	if (!navigator.geolocation) {
		alert("Geolocation is not supported by your browser.");
		return null;
	}

	const canRequest = await requestGeolocationPermission();
	if (!canRequest) return null;

	try {
		const gis = (await getCurrentPos()).coords;
		const { latitude, longitude, accuracy } = gis;
		cachedCoords = { latitude, longitude, accuracy };
		console.log("Fetched GIS for display:", gis);
		return cachedCoords;
	} catch (error) {
		console.error("Error fetching current position for display:", error);
		alert(
			"Could not retrieve your location. Please ensure location services are enabled and try again."
		);
		return null;
	}
};

// called before form submission to inject location state for db
export const injectGeography = async ({ formData }: { formData: FormData }) => {
	const coords = await fetchCoordinatesForDisplay();
	if (!coords) {
		console.warn(
			"injectGeography: Coordinates not fetched, form data will not include new geo-location."
		);
		return;
	}

	formData.set("longitude", String(coords.longitude));
	formData.set("latitude", String(coords.latitude));
	formData.set("accuracy", String(coords.accuracy));
};
