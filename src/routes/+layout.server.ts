import type { Session } from "@supabase/supabase-js";
import { fail } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
	url,
	locals: { supabase, user, safeGetSession }
}) => {
	let session: Session | null = null;
	({ session } = await safeGetSession());

	let payload: DB.AppUser | null = null;

	// fetch profile picture
	if (session) {
		payload = {
			account: {},
			profile: {
				displayName: "",
				avatarUrl: "",
				bio: "",
				githubHandle: "",
				discordHandle: ""
			}
		};

		// fetch from account table first
		let { data, error } = await supabase
			.from("user_account")
			.select()
			.eq("id", user.id)
			.limit(1);
		if (!error) {
			if (data && data.length > 0) {
				payload.account = {
					id: data[0].id,
					username: data[0].username,
					provider: data[0].provider ?? null,
					createdAt: data[0].created_at,
					lastLogin: data[0].last_login,
					isDeactivated: data[0].is_deactivated,
					isDeleted: data[0].is_deleted
				};
			} else {
				console.error("Did not find the user's account details. Perhaps an RLS error?");
			}
		} else {
			console.error(error);
			return fail(500);
		}

		// fetch from profile table
		({ data, error } = await supabase.from("user_profile").select().eq("id", user.id).limit(1));
		if (!error) {
			if (data && data.length > 0) {
				payload.profile = {
					displayName: data[0].display_name ?? "",
					avatarUrl: data[0].avatar_url ?? "",
					bio: data[0].bio ?? "",
					githubHandle: data[0].github_handle ?? "",
					discordHandle: data[0].discord_handle ?? ""
				};
			} else {
				console.error("Did not find the user's profile details. Perhaps an RLS error?");
			}
		} else {
			console.error(error);
			return fail(500);
		}
	}

	// configure navbar appearance
	const appearanceConfig = {
		showLogo: true,
		showCta: true
	};

	if (["/login", "/settings", "/profile"].includes(url.pathname)) {
		appearanceConfig.showLogo = true;
		appearanceConfig.showCta = false;
	}

	return {
		url: url.pathname,
		appearance: appearanceConfig,
		session: session,
		user: payload
	};
};
