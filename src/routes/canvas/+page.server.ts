import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	void session;

	// TODO: Anonymous users can actually view the canvas too (as long as they are within the range)

	// TODO: the selected canvas will dynamically change and will be checked
	const channelName = "qwer-tyui-opas";
	const { data, error } = await supabase
		.from("canvas")
		.select("drawing, id, backup_code, is_archived")
		.eq("backup_code", channelName)
		.limit(1)
		.maybeSingle();

	if (data === null || data.is_archived === true) {
		// TODO: 404 page (maybe we should also do this if the canvas was archived too?)
	}
	if (error) {
		// TODO: error handling
	}

	return {
		canvas: data,
		channelName: channelName
	};
};
