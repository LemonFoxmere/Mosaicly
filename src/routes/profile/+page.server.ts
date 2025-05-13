import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase, user, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) redirect(403, "/login");

	const { data, error } = await supabase.from("canvas").select().eq("user_id", user.id);
	void error;
	// TODO: preprocess the data first

	return { canvas: data };
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
