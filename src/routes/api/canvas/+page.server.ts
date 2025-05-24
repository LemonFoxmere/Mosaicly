import { fail, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
	createCanvas: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			const form = await request.formData();
			const title = form.get("title");
			const locDesc = form.get("loc_desc");
			const longitude = form.get("longitude");
			const latitude = form.get("latitude");
			const accuracy = form.get("accuracy");

			if (!title || title.toString().trim() === "") {
				fail(400, { message: "title cannot be empty" });
			}

			const { error } = await supabase.from("canvas").insert({
				id: crypto.randomUUID(),
				title,
				loc_desc: locDesc,
				longitude,
				latitude,
				accuracy,
				location: `SRID=4269;POINT(${longitude} ${latitude})`,
				user_id: user.id
			});

			if (error) {
				console.error("Could not create new canvas. Error: ", error);
			} else {
				console.log("creating new canvas", "title: ", title, "location:", locDesc);
			}
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
				fail(400, { message: "title cannot be empty" });
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
				fail(400, { message: error, data: form });
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
				fail(400, { message: error, data: form });
			} else {
				// success case, console.log for debug and double checking
				console.log("updated canvas", "is_archived: ", is_archived === "false");
			}
		}
	}
};
