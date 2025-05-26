import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({url, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	void session;

	// TODO: Anonymous users can actually view the canvas too (as long as they are within the range)

	// get backup code parameter (ex: /canvas?c=qwer-tyui-opas)
	const backup_code: string | null = url.searchParams.get("c");

	// parameter null-checking (ex: /canvas without c parameter)
	if (backup_code === null) {
		error(404);
	}
	
	// canvas existence check and archive check
	const channelName = backup_code;
	const { data } = await supabase
		.from("canvas")
		.select("drawing, id, backup_code, is_archived")
		.eq("backup_code", channelName)
		.limit(1)
		.maybeSingle();

	if (data === null || data.is_archived === true) {
		error(404);
	}

	// TODO: distance checking

	return {
		canvas: data,
		channelName: channelName
	};
};
