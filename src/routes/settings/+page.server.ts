import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals: { supabase, safeGetSession, user } }) => {
	const { session } = await safeGetSession();
	if (!session) redirect(403, "/login");

	const tab = url.searchParams.get("tab") ?? "";

	const canvases: DB.Canvas[] = [];

	// fetch from canvas table
	const { data, error } = await supabase.from("canvas").select().eq("user_id", user.id);
	if (!error) {
		if (data && data.length > 0) {
			for (const canvas of data) {
				const mappedCanvas = {
					id: canvas.id,
					userId: canvas.user_id,
					createdOn: canvas.created_on,
					title: canvas.title,
					locDesc: canvas.loc_desc,
					drawing: canvas.drawing,
					isArchived: canvas.is_archived,
					longitude: canvas.longitude,
					latitude: canvas.latitude,
					accuracy: canvas.accuracy,
					location: canvas.location
				};
				canvases.push(mappedCanvas);
			}
		} else {
			console.error("Did not find the user's canvases.");
		}
	} else {
		console.error(error);
		fail(500);
	}

	return { canvas: user?.canvases, tab };
};

export const actions = {
	// save profile on focus lost
	update_profile: async ({ request, locals: { user, supabase } }) => {
		const data = await request.formData();
		const displayName = data.get("disp-name");
		const bio = data.get("bio");

		const { error } = await supabase
			.from("user_profile")
			.update({ display_name: displayName, bio })
			.eq("id", user.id);
		if (error) {
			return fail(400, {
				message: `Error: ${error}`
			});
		}

		return { success: true };
	}
} satisfies Actions;
