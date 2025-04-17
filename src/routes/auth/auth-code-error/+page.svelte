<script lang="ts">
	import { onMount } from "svelte";

	let hash: string;
	let description: string = "¯\\_(ツ)_/¯";

	let showDescription: boolean = false;

	onMount(() => {
		// read the hash, and assign the error and description accordingly
		hash = location.hash.split("#")[1];
		const hashFields: string[] = hash.split("&");

		// search for the error description field
		for (let i = 0; i < hashFields.length; i++) {
			if (hashFields[i].split("=")[0] === "error_description") {
				description = hashFields[i].split("=")[1].replaceAll("+", " ");
				break;
			}
		}
	});
</script>

<main>
	<h1>Uh oh! Something went wrong.</h1>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
</style>
