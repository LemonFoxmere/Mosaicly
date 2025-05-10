import { redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
	signout: async ({ locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			await supabase.auth.signOut();
			throw redirect(303, "/login");
		}
	}
};
