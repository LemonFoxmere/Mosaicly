import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
	url,
	locals: { supabase, user, safeGetSession }
}) => {
	void supabase;
	void user;
	void safeGetSession;

	// let session: Session | null = null;
	// ({ session } = await safeGetSession());

	// configure navbar appearance
	const appearanceConfig = {
		showLogo: true,
		showCta: true
	};

	if (url.pathname === "/login") {
		appearanceConfig.showCta = false;
	}

	return {
		url: url.pathname,
		apperance: appearanceConfig
	};
};
