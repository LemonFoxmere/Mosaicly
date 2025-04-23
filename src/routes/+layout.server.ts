import type { Session } from "@supabase/supabase-js";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
	url,
	locals: { supabase, user, safeGetSession }
}) => {
	void supabase;
	void user;

	let session: Session | null = null;
	({ session } = await safeGetSession());

	// configure navbar appearance
	const appearanceConfig = {
		showLogo: true,
		showCta: true
	};

	if (["/login", "/profile"].includes(url.pathname)) {
		appearanceConfig.showCta = false;
	}

	return {
		url: url.pathname,
		apperance: appearanceConfig,
		session: session
	};
};
