import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	// example db call
	// const canvas = await getcanvasFromDatabase(params.id);

	// if (canvas) {
	// 	return canvas;
	// }

	return { canvas_id: params.id }

	error(404, 'Not found');
};
