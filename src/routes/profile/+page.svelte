<script lang="ts">
	import CanvasCard from "$lib/comp/profile/CanvasCard.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	// get session and user from the page data
	let session = $derived(data.session);
	let user = $derived(data.user);

	let localUser = user;
	let localDisplayName = $derived(localUser?.profile?.displayName ?? "");
	let localBio = $derived(localUser?.profile?.bio ?? "");

	const dummyCanvas = [
		{
			id: "1",
			name: "My Canvas",
			loc: "Engineering 2",
			createdOn: new Date()
		},
		{
			id: "2",
			name: "Frog",
			loc: "Cowell",
			createdOn: new Date()
		}
	];

	// to be replaced with user data from db (will get from SSR)
	let canvases = $state(dummyCanvas); // obj type

	// toggle between Profile | Canvases tab
	let isProfile = $state(true);
</script>

<main>
	<!-- greet user -->
	<section id="intro">
		<h2>Hello, {localDisplayName}.</h2>
		<p>You can edit your profile or manage your canvases here.</p>
	</section>

	<!-- toggle tabs -->
	<section id="tabs-cta">
		<button class={!isProfile ? "outline" : ""} onclick={() => (isProfile = true)}>
			Profile
		</button>
		<button class={isProfile ? "outline" : ""} onclick={() => (isProfile = false)}>
			Canvases
		</button>
	</section>

	<section id="edit-content">
		{#if isProfile}
			<!-- profile render -->
			<form method="POST" action="?/update_profile" id="profile_form">
				<label>
					<p class="caption">Display Name</p>
					<input
						name="disp-name"
						type="text"
						placeholder="Guy"
						bind:value={localDisplayName}
					/>
				</label>

				<label>
					<p class="caption">Bio</p>
					<textarea
						name="bio"
						placeholder="I'm just a chill guy."
						rows="3"
						value={localBio}
					></textarea>
				</label>

				<button style="margin: 1rem 0">Save</button>
			</form>
		{:else}
			<!-- canvases list render -->
			<div class="canvas_list">
				{#each canvases as canvas}
					<CanvasCard {canvas} />
				{/each}
			</div>
		{/if}
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.canvas_list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	main {
		padding: 5px 30px;
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;
		row-gap: 30px;

		justify-self: center;

		#intro {
			display: flex;
			flex-direction: column;
			gap: 0.3rem;
		}

		#tabs-cta {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 10px;

			button {
				width: 100%;
			}
		}

		#edit-content {
			#profile_form {
				display: flex;
				flex-direction: column;
				row-gap: 15px;

				label {
					display: flex;
					flex-direction: column;
				}
			}
		}
	}
</style>
