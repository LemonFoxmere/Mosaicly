<script lang="ts">
	import { onMount } from "svelte";

	let hash: string;
	let description: string | null = null;

	let showDescription: boolean = false;

	onMount(() => {
		// read the hash, and assign the error and description accordingly
		hash = location.hash.split("#")[1];
		const hashFields: string[] = hash.split("&");
		// search for the error description field
		for (let i = 0; i < hashFields.length; i++) {
			if (hashFields[i].split("=")[0] === "error_description") {
				description = `Reason: ${hashFields[i].split("=")[1].replaceAll("+", " ")}.`;
				break;
			}
		}
	});
</script>

<main>
	<section id="title-container">
		<h2>Seems's like the login failed...</h2>
		<p>{description ?? "We don't know what happened either ¯\\_(ツ)_/¯"}</p>
	</section>

	<section id="cta">
		<a class="wrapper" href="/">
			<button>Go back home</button>
		</a>
		<a class="wrapper" href="/login">
			<button class="outline">Try logging in again</button>
		</a>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: fit-content;
		row-gap: 30px;
		padding: 30px 30px $navbar-height 30px;
		margin: auto 0px;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;

		#title-container {
			display: flex;
			flex-direction: column;
			row-gap: 15px;

			p {
				font-size: 18px;
			}
		}

		#cta {
			width: 100%;
			height: fit-content;
			display: flex;
			flex-direction: column;
			gap: 10px;

			a,
			button {
				width: 100%;
			}
		}
	}
</style>
