import type { Actions } from "./$types";

export async function load() {
	// create a class for storing state per user
	const dummyCanvases = [
		{
			id: "1",
			name: "My Canvas",
			loc: "Engineering 2",
			createdOn: new Date()
		},
		{
			id: "2",
			name: "Frog",
			loc: "Cowell",
			createdOn: new Date()
		}
	];

	return { canvases: dummyCanvases };

	// check for auth (handled via hooks)
	// get user name, displayName, bio
}

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
