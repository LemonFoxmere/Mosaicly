<script lang="ts">
	import CanvasCard from "$lib/comp/profile/CanvasCard.svelte";
	import CanvasCreator from "$lib/comp/profile/CanvasCreator.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	// get session and user from the page data
	let session = $derived(data.session);
	let user = $derived(data.user);

	let localUser = user;
	let localDisplayName = $derived(localUser?.profile?.displayName ?? "");
	let localBio = $derived(localUser?.profile?.bio ?? "");

	const dummyCanvas = $state([
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
	]);

	// to be replaced with user data from db (will get from SSR)
	let canvases = $state(dummyCanvas); // obj type

	// toggle between Profile | Canvases tab
	let isProfile = $state(true);

	// DELETE LATER: function that adds a canvas to the array "canvases"
	function AddCanvasToPage() {
		let newItem = {
			id: (canvases.length + 1).toString(),
			name: `Canvas ${canvases.length + 1}`,
			loc: "Engineering 2",
			createdOn: new Date()
		};
		canvases.push(newItem);
	}

	let isOpen = $state(false);
</script>

<main>
	<!-- greet user -->
	<section id="intro">
		<section id="title-container">
			<h2 id="title"><span>Greetings,</span><br />{localDisplayName}.</h2>
			{#if user}
				<img id="pfp" src={user.profile.avatarUrl} alt="Profile Picture" />
			{/if}
		</section>
		<p id="desc">You can edit your profile or manage your canvases here.</p>
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

				<button>Save</button>
			</form>
		{:else}
			<button
				onclick={() => {
					isOpen = true;
				}}>Create Canvas</button
			>
			{#if isOpen}
				<CanvasCreator isFormOpen={isOpen}></CanvasCreator>
			{/if}

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

		display: flex;
		flex-direction: column;
		row-gap: 30px;

		justify-self: center;

		@media screen and (min-width: $mobile-width) {
			height: fit-content;
			margin: auto 0px;
			padding-bottom: calc(5px + $urlbar-height);
		}

		#intro {
			display: flex;
			flex-direction: column;
			row-gap: 20px;

			#title-container {
				display: flex;
				align-items: center;
				column-gap: 25px;

				#title {
					flex-grow: 1;
					span {
						font-weight: 400;
					}
				}

				#pfp {
					width: 64px;
					height: 64px;
					border-radius: 100%;
				}
			}
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
