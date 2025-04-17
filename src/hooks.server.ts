import { createServerClient } from "@supabase/ssr";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { Session, User } from "@supabase/supabase-js";

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		// pass along SvelteKit's fetch to supabase-js for SSR
		global: { fetch: event.fetch },

		// new cookie API: getAll / setAll
		cookies: {
			// Retrieve all cookies from the incoming request
			getAll: () => event.cookies.getAll(),

			// Apply any cookie writes back to the response
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					// replicate previous default behavior by forcing path
					event.cookies.set(name, value, { ...options, path: "/" });
				});
			}
		},

		// (Optional) if you need custom cookie options:
		cookieOptions: {
			sameSite: "lax",
			secure: false
		}
	});

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async (): Promise<{
		session: Session | null;
		user: User | null;
	}> => {
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (!user || error) {
			// JWT validation has failed
			return { session: null, user: null };
		}

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		// If there isn't a session, there can't be a user either
		if (!session) return { session: null, user: null };

		// Workaround for the "Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure" warning
		const safeSession: Session = {
			access_token: session.access_token,
			refresh_token: session.refresh_token,
			token_type: "bearer",
			expires_at: session.expires_at,
			expires_in: session.expires_in,
			provider_refresh_token: session.provider_refresh_token,
			provider_token: session.provider_token,
			user: user
		};

		return { session: safeSession, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === "content-range" || name === "x-supabase-api-version";
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!event.locals.session && event.url.pathname.startsWith("/private")) {
		return redirect(303, "/auth");
	}

	if (event.locals.session && event.url.pathname === "/auth") {
		return redirect(303, "/private");
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
