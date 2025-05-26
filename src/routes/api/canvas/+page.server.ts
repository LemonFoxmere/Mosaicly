import { fail, type Actions } from "@sveltejs/kit";

const maxCanvasNameLen = 30;
const isCanvasNameValid = (name: string) => {
	return !!name && name.length <= maxCanvasNameLen;
};

const maxLocationDescLen = 200;
const isLocationDescValid = (val: string) => {
	return val.length <= maxLocationDescLen;
};

const isLocationValid = (longitude: number, latitude: number, accuracy: number) => {
	return (
		!isNaN(longitude) &&
		!isNaN(accuracy) &&
		!isNaN(latitude) &&
		longitude >= -180 &&
		longitude <= 180 &&
		latitude >= -90 &&
		latitude <= 90 &&
		accuracy >= 0 &&
		accuracy <= 100000 // 100km max accuracy
	);
};

export const actions: Actions = {
	createCanvas: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			// get data from form
			const form = await request.formData();

			const title = form.get("title");
			const locDesc = form.get("loc_desc");
			const longitude = form.get("longitude");
			const latitude = form.get("latitude");
			const accuracy = form.get("accuracy");

			// do some checks
			if (!isCanvasNameValid(title?.toString() || ""))
				return fail(400, { message: "Invalid canvas title" });

			if (!isLocationDescValid(locDesc?.toString() || ""))
				return fail(400, { message: "Invalid location description" });

			// check if longitude and latitude are valid numbers
			const lng = parseFloat(longitude?.toString() || "");
			const lat = parseFloat(latitude?.toString() || "");
			const acc = parseFloat(accuracy?.toString() || "");
			if (!isLocationValid(lng, lat, acc)) {
				return fail(400, { message: "Invalid longitude or latitude" });
			}

			// send it over
			const { error } = await supabase.from("canvas").insert({
				id: crypto.randomUUID(), // generate a random UUID for the canvas
				title,
				loc_desc: locDesc,
				longitude,
				latitude,
				accuracy,
				location: `SRID=4269;POINT(${longitude} ${latitude})`, // PostGIS point format
				user_id: user.id
			});

			if (error) {
				// if fail, send back error message with form data untouched
				return fail(400, { message: error.message, data: form });
			}

			return { success: true };
		} else {
			// unauthorized
			return fail(401);
		}
	},
	updateCanvas: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			const form = await request.formData();
			const title = form.get("title");
			const locDesc = form.get("loc_desc");
			const canvasId = form.get("canvas_id");

			if (!title || title.toString().trim() === "") {
				return fail(400, { message: "title cannot be empty" });
			}

			// owner can update canvas
			const { error } = await supabase
				.from("canvas")
				.update({
					title,
					loc_desc: locDesc
				})
				.eq("id", canvasId)
				.eq("user_id", user.id);

			if (error) {
				// if fail, send back error message with form data untouched
				return fail(400, { message: error, data: form });
			} else {
				// success case, console.log for debug and double checking
				console.log("updated canvas", "title:", title, "location:", locDesc);
			}
		}
	},
	toggleArchiveCanvas: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			const form = await request.formData();
			const is_archived = form.get("is_archived"); // boolean string, ie "false"
			const canvas_id = form.get("canvas_id");

			// owner can update canvas
			const { error } = await supabase
				.from("canvas")
				.update({
					is_archived: is_archived === "false"
				})
				.eq("id", canvas_id)
				.eq("user_id", user.id);

			if (error) {
				// if fail, send back error message with form data untouched
				return fail(400, { message: error, data: form });
			} else {
				// success case, console.log for debug and double checking
				console.log("updated canvas", "is_archived: ", is_archived === "false");
			}
		}
	}
};
