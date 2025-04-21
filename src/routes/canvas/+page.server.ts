import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	// redirect perma to canvas search
	throw redirect(303, "/search");
};
