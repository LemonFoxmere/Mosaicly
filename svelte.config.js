import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import("@sveltejs/kit").Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			runtime: "nodejs22.x"
		}),

		env: {
			dir: "./"
		},

		// route alias
		alias: {
			$static: "./static",
			$comp: "$lib/comp",
			$route: "src/routes"
		}
	},

	compilerOptions: {
		warningFilter: (warning) => {
			return warning.code === "css-unused-selector" || warning.code.startsWith("a11y-");
		}
	}

	// vitePlugin: {
	// 	onwarn: (warning, handler) => {
	// 		// Suppress unused CSS selector warnings and accessibility warnings
	// 		if (warning.code === "css-unused-selector" || warning.code.startsWith("a11y-")) {
	// 			return;
	// 		}
	// 		handler(warning);
	// 	}
	// }
};

export default config;
