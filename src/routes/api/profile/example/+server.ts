/**
 * This is an example of how you might write an API endpoint!
 * You can use this as a starting point for your own API endpoints when talking to Supabase.
 *
 * For this specific example, the GET request would be located at `https://hostname/api/profile/example?p=somevalue`
 * You can change the `p` parameter to whatever you want, and it will be accessible in the code below.
 */

import { error as HTTPError, json, type RequestHandler } from "@sveltejs/kit";

// An example get request handler. Along with the basic HTTP methods and URL, we also get
// access to the locals object, which contains our Supabase client (check hooks.server.ts for implementation).
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	// temporary - gets rid of the unused err
	void supabase;

	// you can get a URL parameter like this
	let param: string | null = (await url.searchParams.get("p")) ?? null;

	if (!param) HTTPError(400, { message: "Bad request" }); // if the parameter is not provided, we return a 400 error

	// lowercase the parameter
	param = param.toLowerCase();

	// try to get some data from supabase. This is commneted our because it's just an example,
	// but you get the point.

	// const { data, error } = await supabase.from("users").select("id").eq("handle", param);
	// if (error) HTTPError(500, { message: error.message });

	// if (data.length === 0) HTTPError(404, { message: "Handle not found" }); // if not found

	// console.log(param);

	return json({ param });
};
