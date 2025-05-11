import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

/**
 * load function for the page. Checks if the user is signed in.
 * If the user is not signed in, redirects to the /login page.
 */
export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) {
		redirect(303, "/login");
	}
	// also you can return props to the page if needed for logged-in users
	return {};
};
