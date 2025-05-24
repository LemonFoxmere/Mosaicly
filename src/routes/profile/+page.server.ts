import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, parent, locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) redirect(403, "/login");

	const tab = url.searchParams.get("tab") ?? "";

	const { user } = await parent();

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
