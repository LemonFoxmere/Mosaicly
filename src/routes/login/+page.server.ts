import { redirect, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { AuthApiError, type Provider } from "@supabase/supabase-js";

export const load: PageServerLoad = async () => {

}

export const actions: Actions = {
	login: async({ request, locals, url }) => {

		const provider = url.searchParams.get("provider") as Provider;

		if(provider){
			const { data, error: err } = await locals.supabase.auth.signInWithOAuth({
				provider: provider
			})

			if(err){
				return fail(400, {
					message: "Something went wrong."
				});
			}

			console.log("data: " + data);
			//throw redirect(303, data.url);
		}

		const body = Object.fromEntries(await request.formData());

		const { data, error: err } = await locals.supabase.auth.signInWithPassword({
			email: body.email as string,
			password: body.password as string,
		})

		if(err) {
			if(err instanceof AuthApiError && err.status == 400){
				return fail(400, {
					error: "Invalid credentials",
				})
			}
			return fail(500, {
				error: "Server error, try again later",
			})

			throw redirect(303, "/")
		}
	},
}