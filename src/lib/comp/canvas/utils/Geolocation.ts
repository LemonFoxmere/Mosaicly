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
		const status = await navigator.permissions.query({
			name: "geolocation"
		});
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

// called before form submission to inject location state for db
export const injectGeography = async ({ formData }: { formData: FormData }) => {
	const canRequest = await requestGeolocationPermission();
	if (!canRequest) return;

	const gis = (await getCurrentPos()).coords;
	console.log("gis", gis);

	formData.set("longitude", String(gis.longitude));
	formData.set("latitude", String(gis.latitude));
	formData.set("accuracy", String(gis.accuracy));
};
