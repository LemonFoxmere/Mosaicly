import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	// example db call
	// const canvas = await getcanvasFromDatabase(params.id);

	// if (canvas) {
	// 	return canvas;
	// }

	return { canvas_id: params.id };
};
