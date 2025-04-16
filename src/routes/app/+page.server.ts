import type { Actions } from './$types';

export async function load() {
  // check for auth (handled via hooks)
  // get user name, displayName, bio
  
}

export const actions = {
  // save profile on focus lost
  update_profile: async ({ cookies, request }) => {
		const data = await request.formData();
		const name = data.get('disp-name');
		const bio = data.get('bio');

		console.log(name, bio)
		// const user = await db.updateUser(displayName, bio);

		return { success: true };
 
  }
} satisfies Actions
