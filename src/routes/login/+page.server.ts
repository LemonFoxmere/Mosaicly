import { BASE_URL } from "$lib/supabaseClient";
import type { Provider } from "@supabase/supabase-js";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types.d";

const SUPPORTED_PROVIDERS = ["google", "discord", "github"];

/**
 * load function for the page. Checks if the user is already signed in.
 * If the user is signed in, redirects to the base URL.
 */
export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (session) redirect(303, "/settings#profile"); // If the user is already signed in, redirect to profile
};

export const actions: Actions = {
	login: async ({ url, locals: { supabase } }) => {
		const provider = url.searchParams.get("provider") as Provider;

		// if a provider is specified, attempt to sign in with OAuth
		if (provider) {
			// check if the provider is supported
			if (!SUPPORTED_PROVIDERS.includes(provider)) {
				return fail(400, {
					message: "Provider not supported."
				});
			}

			// sign in with OAuth using the specified provider
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: provider,
				options: {
					redirectTo: `${BASE_URL}/auth/confirm/oauth/` // Redirect URL after OAuth sign-in
				}
			});

			// handle any errors during the OAuth sign-in process
			if (error || !data.url) {
				return fail(500, {
					message: "Something went wrong."
				});
				return; // makes the ts error go away
			}

			// redirect to the OAuth confirmation page
			throw redirect(303, data.url);
		}

		// If no provider is specified, fail with bad request
		return fail(400, {
			message: "No provider specified."
		});
	}
};
