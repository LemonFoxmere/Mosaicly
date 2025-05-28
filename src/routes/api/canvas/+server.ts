import { error, json } from "@sveltejs/kit";

// database canvas GET request (get canvas either by ID or author ID. Prioritize user ID)
export async function GET({ request, setHeaders, locals: { supabase, safeGetSession } }) {
	// extract the user ID or canvas ID from request
	const url = new URL(request.url);
	const userId = url.searchParams.get("u");
	const canvasId = url.searchParams.get("c");
	if (!userId && !canvasId) {
		error(400, "Bad Request: No u(userID) or c(canvasID) provided.");
	}

	// if userId is provided, fetch all canvases for that user IF the session user matches the userId
	if (userId) {
		// get session
		const { session } = await safeGetSession();
		if (!session) {
			error(403, "Forbidden: No session found.");
		}
		// check if session user matches the userId
		if (session.user.id !== userId) {
			error(403, "Forbidden: why are you being so nosy?");
		}

		void setHeaders;
		// setHeaders({
		// 	"cache-control": "public, max-age=60, stale-while-revalidate=30"
		// });

		const { data, error: fetchError } = await supabase
			.from("canvas")
			.select()
			.eq("user_id", userId)
			.order("created_on", { ascending: false });

		if (fetchError) {
			console.error(fetchError); // log the error for debugging
			error(500, "Internal Server Error: Could not fetch canvases.");
		}

		// format the data into the shape of DB.Canvas
		const payload: DB.Canvas[] = data.map((canvas) => ({
			id: canvas.id,
			userId: canvas.user_id,
			backupCode: canvas.backup_code,
			title: canvas.title,
			locDesc: canvas.loc_desc,
			isArchived: canvas.is_archived,
			createdOn: new Date(canvas.created_on),
			longitude: canvas.longitude,
			latitude: canvas.latitude
		}));

		return json(payload, { status: 200 });
	}

	// if canvasId is provided, fetch the canvas with that ID
	if (canvasId) {
		const { data, error: fetchError } = await supabase
			.from("canvas")
			// choose everything except for the drawing, which could be a lot of useless data
			.select(
				"id, user_id, backup_code, title, loc_desc, is_archived, created_on, longitude, latitude"
			)
			.eq("id", canvasId)
			.single(); // we expect a single canvas

		if (fetchError) {
			console.error(fetchError); // log the error for debugging
			error(500, "Internal Server Error: Could not fetch canvas.");
		}

		// format the data into the shape of DB.Canvas
		const payload: DB.Canvas = {
			id: data.id,
			userId: data.user_id,
			backupCode: data.backup_code,
			title: data.title,
			locDesc: data.loc_desc,
			isArchived: data.is_archived,
			createdOn: new Date(data.created_on),
			longitude: data.longitude,
			latitude: data.latitude
		};

		return json(payload, { status: 200 });
	}
}

// database drawing PATCH request (updates canvas drawing json)
export async function PATCH({ request, locals: { supabase, safeGetSession } }) {
	const { session } = await safeGetSession();
	if (session) {
		const { canvasID, drawing } = await request.json();

		const resp = await supabase.from("canvas").update({ drawing: drawing }).eq("id", canvasID);

		if (resp && resp.status >= 200 && resp.status < 300) {
			return json(null, { status: 200 });
		} else if (resp) {
			// throw error if something went wrong
			error(resp.status, resp.statusText);
		} else {
			error(400); // bad req
		}
	} else {
		error(403); // forbidden
	}
}
