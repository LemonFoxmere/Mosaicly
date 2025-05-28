<script lang="ts">
	import { page } from "$app/state";
	import type { PageProps } from "./$types";
	void page;

	let { data }: PageProps = $props();

	let statusCode = $derived(page.status);
	let statusMsg = $derived.by(() => {
		switch (statusCode) {
			case 404:
				return "We don't know what you're trying to look for, and it probably doesn't exist.";
			case 403:
				return "You don't have permission to access this page.";
			case 400:
				return "Bad request. Please check your input.";
			case 500:
				return "Yikes, something went wrong on our end.";
		}
	});
</script>

<main>
	<section id="title-container">
		<h1>{statusCode}</h1>
		<p>{statusMsg}</p>
	</section>

	<section id="cta-container">
		{#if statusCode === 404}
			<a href="/" class="fill"><button>Go back home instead</button></a>
		{:else if statusCode === 403}
			{#if !data.session}
				<a href="/login" class="fill"><button>Try Logging In</button></a>
			{/if}
			<a href="/" class:fill={data.session}><button class="outline">Go home</button></a>
		{:else if statusCode === 500}
			<button
				class="fill"
				on:click={() => {
					window.location.reload();
				}}>Reload</button
			>
			<a href="/" class="fill"><button class="outline">Go home</button></a>
		{/if}
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		// border: 1px solid blue;
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		row-gap: 30px;

		padding: 10px 30px;
		padding-bottom: $navbar-height;

		#title-container {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 5px;
		}

		#cta-container {
			width: 100%;
			display: flex;
			column-gap: 10px;

			* {
				text-decoration: none;
				&.fill {
					flex-grow: 1;
					* {
						width: 100%;
					}
				}
			}
		}
	}
</style>
