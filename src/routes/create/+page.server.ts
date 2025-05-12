import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

/**
 * load function for the page. Checks if the user is already signed in.
 * If the user is signed in, redirects to the base URL.
 */
export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (session) redirect(303, "/profile"); // If the user is already signed in, redirect to profile
};
