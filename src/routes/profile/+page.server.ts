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
	update_profile: async ({ request, locals: { supabase } }) => {
		void request;
		void supabase; // TODO: remove this line when supabase is used

		// const data = await request.formData();
		// const name = data.get("disp-name");
		// const bio = data.get("bio");

		// console.log(name, bio);
		// const user = await db.updateUser(displayName, bio);

		return { success: true };
	}
} satisfies Actions;
