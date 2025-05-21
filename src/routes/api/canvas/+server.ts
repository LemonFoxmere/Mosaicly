import { error, json } from "@sveltejs/kit";

// database drawing post request
export async function POST({ request, locals: { supabase, safeGetSession } }) {
	const { session } = await safeGetSession();
	if (session) {
		const { canvasID, drawing } = await request.json();

		const resp = await supabase.from("canvas").update({ drawing: drawing }).eq("id", canvasID);

		if (resp && resp.status >= 200 && resp.status < 300) {
			return json(null, { status: 200 });
		} else if (resp) {
			// throw error if something went wrong
			error(resp.status, resp.statusText);
		} else {
			error(400); // bad req
		}
	} else {
		error(403); // forbidden
	}
}
