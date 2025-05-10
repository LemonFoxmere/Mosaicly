import type { Actions } from "./$types";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase, user, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) redirect(403, "/login");

	const { data, error } = await supabase.from("canvas").select().eq("user_id", user.id);
	return { canvas: data };
};

export const actions = {
	// save profile on focus lost
	update_profile: async ({ request, locals: { user, supabase } }) => {
		const data = await request.formData();
		const display_name = data.get("disp-name");
		const bio = data.get("bio");

		const { error } = await supabase
			.from("user_profile")
			.update({ display_name, bio })
			.eq("id", user.id);
		if (error) {
			return { success: false, message: `error: ${error}` };
		}

		return { success: true };
	}
} satisfies Actions;
