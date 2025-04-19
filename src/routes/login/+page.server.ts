import { redirect, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { AuthApiError, type Provider } from "@supabase/supabase-js";

const OAUTH_PROVIDERS = ["github", "google", "discord"];

export const load: PageServerLoad = async () => {

}

export const actions: Actions = {
	login: async({ request, locals, url }) => {
		console.log("login begin")

		const provider = url.searchParams.get("provider") as Provider;

		if(provider){
			if(!OAUTH_PROVIDERS.includes(provider)){
				return fail(400, {
					message: "Provider not supported."
				});
			}
			const { data, error: err } = await locals.supabase.auth.signInWithOAuth({
				provider: provider,

			})

			if(err){
				return fail(400, {
					message: "Something went wrong."
				});
			}

			throw redirect(303, data.url); // redirect users to provider's url
		}

		return fail(400, {
			message: "No provider."
		});
	},
}