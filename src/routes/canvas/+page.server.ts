import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase, user, safeGetSession } }) => {
	const { session } = await safeGetSession();
	// if (!session) redirect(403, "/login");
	// TODO: 404 page

	// TODO: Anonymous users can actually view the canvas too (as long as they are within the range)

	// TODO: the selected canvas will dynamically change and will be checked
	const channelName = "qwer-tyui-opas";
	const { data, error } = await supabase
		.from("canvas")
		.select("drawing, id, backup_code")
		.eq("backup_code", channelName)
		.maybeSingle();
	void error;
	// TODO: preprocess the data first and error handling

	return {
		canvas: data,
		channelName: channelName
	};
};
