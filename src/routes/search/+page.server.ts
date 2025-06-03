import { fail, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
	searchCanvas: async ({ request, locals: { supabase } }) => {
		// get form data
		const form = await request.formData();
		const formValues = Object.fromEntries(form);

		const code = form.get("canvasCode")?.toString() ?? "";

		if (code.trim() === "") {
			// check if it's empty
			fail(400, formValues);
		}

		// try to find in the db
		const { data, error } = await supabase
			.from("canvas")
			.select("backup_code")
			.eq("backup_code", code)
			.eq("is_archived", false) // only get non-archived canvases
			.limit(1);

		if (error) {
			return fail(500, formValues);
		}

		if (!data || data.length === 0) {
			return fail(404, formValues); // not found, 404
		}

		// found, return the canvas
		return {
			canvas: data[0],
			success: true,
			message: "Canvas found successfully."
		};
	}
};
