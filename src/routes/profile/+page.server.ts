import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies, locals: { supabase } }) => {
	void url;
	void cookies;
	void supabase;
	// check for auth (handled via hooks)
	// get user name, displayName, bio
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
