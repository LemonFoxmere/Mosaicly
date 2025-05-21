import { error, json } from "@sveltejs/kit";

// database drawing post request
export async function POST({ request, locals: { supabase, safeGetSession } }) {
	const { session } = await safeGetSession();
	if (session) {
		const { canvasID, drawing } = await request.json();

		const err = await supabase.from("canvas").update({ drawing: drawing }).eq("id", canvasID);

		// TODO: error handling
		// if (error) {
		// 	console.error("Could not save current canvas. Error: ", error);
		// } else {
		// 	console.log("Canvas saved to database");
		// }

		if (err) {
			// throw error if something went wrong
			error(err.status, err.statusText);
		}
	} else {
		error(403); // forbidden
	}

	return json(null, { status: 200 });
}
