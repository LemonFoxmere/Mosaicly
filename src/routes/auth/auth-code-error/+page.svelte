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
	<section id="text">
		<h1>Uh oh! Something went wrong.</h1>
		<p>The authentication process has failed for some reason, and here we are.</p>
	</section>

	<section id="cta">
		<a href="/">
			<button class="solid">Go Back Home</button>
		</a>
		<button
			id="why"
			on:click={() => {
				showDescription = !showDescription;
			}}>{showDescription ? "I see" : "Why?"}</button
		>
	</section>

	<h6 id="error" class={showDescription ? "" : "hidden"}>{description}</h6>
</main>

<style lang="scss">
	@import "$static/stylesheets/guideline";

	main {
		width: 100%;
		height: 100%;

		padding: 0px 20px;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		row-gap: 32px;

		#text {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;

			row-gap: 15px;

			p {
				font-size: 18px;
			}
		}

		#cta {
			display: flex;
			column-gap: 10px;
			button {
				padding: 10px 20px;
			}
			a {
				text-decoration: none;
			}
		}

		#error {
			font-size: 18px;
			color: $accent-error;
			text-align: center;
			transform: translateY(0px);

			transition: all 700ms $out-generic-expo;

			&.hidden {
				opacity: 0;
				transform: translateY(10px);
				pointer-events: none;
			}
		}

		@media screen and (max-width: $mobile-width) {
			#cta {
				width: 100%;

				button {
					height: 48px;
					padding: 0px;

					&#why {
						width: 150px;
					}
				}

				a {
					width: 100%;

					button {
						width: 100%;
					}
				}
			}
		}
	}
</style>
