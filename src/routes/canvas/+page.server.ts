import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	// TODO: Anonymous users can actually view the canvas too (as long as they are within the range)

	// get backup code parameter (ex: /canvas?c=qwer-tyui-opas)
	const backupCode: string | null = url.searchParams.get("c");

	// parameter null-checking (ex: /canvas without c parameter)
	if (backupCode === null) {
		error(404);
	}

	// canvas existence check and archive check
	const channelName = backupCode;
	const { data: rawData } = await supabase
		.from("canvas")
		.select("title, loc_desc, longitude, latitude, drawing, id, backup_code, is_archived")
		.eq("backup_code", channelName)
		.limit(1)
		.maybeSingle();

	if (rawData === null || rawData.is_archived === true) {
		error(404);
	}

	return {
		canvas: rawData,
		channelName: channelName,
		session: session
	};
};
