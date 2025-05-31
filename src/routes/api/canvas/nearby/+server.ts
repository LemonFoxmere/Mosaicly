import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // Earth radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c; // Distance in km
}

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const latStr = url.searchParams.get("lat");
	const lonStr = url.searchParams.get("lon");

	if (!latStr || !lonStr) {
		return json({ error: "Missing latitude or longitude" }, { status: 400 });
	}

	const userLat = parseFloat(latStr);
	const userLon = parseFloat(lonStr);

	if (isNaN(userLat) || isNaN(userLon)) {
		return json({ error: "Invalid coordinates" }, { status: 400 });
	}

	// Fetch all non-archived canvases
	const { data: canvases, error } = await supabase
		.from("canvas")
		.select("id, title, loc_desc, latitude, longitude, backup_code, created_on")
		.eq("is_archived", false);

	if (error) {
		console.error("Database error:", error);
		return json({ error: "Failed to fetch canvases" }, { status: 500 });
	}

	if (!canvases) {
		return json({ canvases: [] });
	}

	// Calculate distances and filter nearby canvases (within 30 miles / ~48km)
	const MAX_DISTANCE_KM = 48;

	const nearbyCanvases = canvases
		.map((canvas) => {
			const distance = calculateDistance(userLat, userLon, canvas.latitude, canvas.longitude);
			return {
				...canvas,
				distance_km: distance,
				distance_mi: distance * 0.621371 // Convert km to miles
			};
		})
		.filter((canvas) => canvas.distance_km <= MAX_DISTANCE_KM)
		.sort((a, b) => a.distance_km - b.distance_km)
		.slice(0, 10); // Limit to 10 closest canvases

	return json({ canvases: nearbyCanvases });
};
