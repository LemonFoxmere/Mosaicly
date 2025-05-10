<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import CanvasCard from "$lib/comp/profile/CanvasCard.svelte";
	import CreateCanvasMenu from "$lib/comp/profile/CreateCanvasMenu.svelte";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();

	// get session and user from the page data
	let session = $derived(data.session);
	let user = $derived(data.user);

	let canvases = $derived<DB.Canvas[]>(data.canvas || []);

	// user copy, for optimistic ui updates
	let localUser = user;
	let localDisplayName = $derived(localUser?.profile?.displayName ?? "");
	let localBio = $derived(localUser?.profile?.bio ?? "");

	let isUnsaved = $derived(
		localBio != user?.profile.bio || localDisplayName != user.profile.displayName
	);

	// toggle between Profile | Canvases tab
	let isProfile = $state(true);
</script>

<main>
	<!-- greet user -->
	<section id="intro">
		<section id="title-container">
			<h2 id="title">
				<span>Greetings,</span>
				<br />{localDisplayName}.
			</h2>
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
			<form
				method="POST"
				action="?/update_profile"
				id="profile_form"
				use:enhance={() => {
					return async ({ update }) => {
						await update({ reset: false });
					};
				}}
			>
				<label>
					<p class="caption">Display Name</p>
					<input
						name="disp-name"
						type="text"
						placeholder="Guy"
						autocomplete="off"
						bind:value={localDisplayName}
					/>
				</label>

				<label>
					<p class="caption">Bio</p>
					<textarea
						name="bio"
						placeholder="I'm just a chill guy."
						rows="3"
						autocomplete="off"
						bind:value={localBio}
					></textarea>
				</label>

				{#if isUnsaved}
					<p>There are unsaved changes!</p>
				{:else if form?.success}
					<p>Your changes are saved!</p>
				{/if}
				<button>Save</button>
			</form>
		{:else}
			<!-- canvases list render -->
			<div class="canvas_list">
				{#each canvases as canvas}
					<CanvasCard {canvas} />
				{/each}

				<!-- add new canvas, popup like modal -->
				<CreateCanvasMenu />
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
					width: 60px;
					height: 60px;
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
