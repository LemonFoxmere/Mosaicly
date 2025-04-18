import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { AuthApiError, type Provider } from "@supabase/supabase-js";

const generateRandomString = (length: number) => {
	// for PKCE
	const array = new Uint32Array(length);
	crypto.getRandomValues(array);
	return Array.from(array, (dec) => {
		const hex = dec.toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	}).join("");
};

export const load: PageServerLoad = async ({ url, cookies, locals: { supabase } }) => {
	const code = url.searchParams.get("code");
	const err = url.searchParams.get("error");

	if (err) {
		// handle error
		switch (err) {
			case "access_denied":
				throw redirect(303, "/signin");
			default:
				throw redirect(303, "/auth/auth-code-error");
		}
	}

	const codeVerifier = generateRandomString(128);
	cookies.set("pkce_code_verifier", codeVerifier, {
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "lax" // might have to change this to "strict" in production
	});

	const { error } = await supabase.auth.exchangeCodeForSession(`${code}`);

	if (error) {
		console.error("Error exchanging code for session:", error);
		throw redirect(303, "/auth/auth-code-error");
	}
};

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

			console.log(data);
			throw redirect(303, data.url);
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