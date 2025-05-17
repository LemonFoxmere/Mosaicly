import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
	createCanvas: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			const form = await request.formData();
			const title = form.get("title");
			const loc_desc = form.get("loc_desc");
			const longitude = form.get("longitude");
			const latitude = form.get("latitude");
			const accuracy = form.get("accuracy");

			const { error } = await supabase.from("canvas").insert({
				id: crypto.randomUUID(),
				title,
				loc_desc,
				longitude,
				latitude,
				accuracy,
				location: `SRID=4269;POINT(${longitude} ${latitude})`,
				user_id: user.id
			});

			if (error) {
				console.error("Could not create new canvas. Error: ", error);
			} else {
				console.log("creating new canvas", "title: ", title, "location:", loc_desc);
			}
		}
	},
	updateCanvas: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			const form = await request.formData();
			const title = form.get("title");
			const loc_desc = form.get("loc_desc");
			const canvas_id = form.get("canvas_id");

			// owner can update canvas
			const { error } = await supabase
				.from("canvas")
				.update({
					title,
					loc_desc
				})
				.eq("id", canvas_id)
				.eq("user_id", user.id);

			if (error) {
				console.error("Could not update canvas. Error: ", error);
			} else {
				console.log("updated canvas", "title:", title, "location:", loc_desc);
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
				console.error("Could not update canvas. Error: ", error);
			} else {
				console.log("updated canvas", "is_archived: ", is_archived === "false");
			}
		}
	}
};
