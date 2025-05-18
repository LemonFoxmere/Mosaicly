// database drawing post request
export async function POST({ request, locals: { supabase, safeGetSession } }) {
	const { session } = await safeGetSession();
	if (session) {
		const { canvasID, drawing } = await request.json();

		const error = await supabase.from("canvas").update({ drawing: drawing }).eq("id", canvasID);

		// TODO: error handling
		// if (error) {
		// 	console.error("Could not save current canvas. Error: ", error);
		// } else {
		// 	console.log("Canvas saved to database");
		// }

		const response = new Response(JSON.stringify(error));
		return response;
	}
}
