<script lang="ts">
	import { enhance } from "$app/forms";
	import CanvasCard from "$lib/comp/profile/CanvasCard.svelte";
	import Modal from "$lib/comp/profile/EditCanvasModal.svelte";
	import CreateCanvasMenu from "$lib/comp/profile/CreateCanvasMenu.svelte";
	import type { PageProps } from "./$types";
	import { LoaderCircle } from "@lucide/svelte";

	let { data, form }: PageProps = $props();

	// local state, sync from upstream as updates roll in
	const profile = $derived(data.user?.profile);
	let { displayName, bio } = $derived(data.user!.profile);

	let canvases = $derived<DB.Canvas[]>(data.canvas || []);

	let isSaving = $state(false);

	// toggle between Profile | Canvases tab
	let isProfile = $state(true);

	// check if there are unsaved changes
	let isUnsaved = $derived(bio !== profile?.bio || displayName !== profile?.displayName);

	// CANVAS / modal
	let isOpen = $state(false);
	let focusedCanvas = $state<DB.Canvas>();

	const setCurrCanvas = (canvas: DB.Canvas) => {
		focusedCanvas = canvas;
		isOpen = true;
	};

	$inspect(focusedCanvas);
</script>

<main>
	<!-- greet user -->
	<section id="intro">
		<section id="title-container">
			<h2 id="title">
				<span>Greetings,</span>
				<br />{displayName}.
			</h2>
			{#if profile}
				<img id="pfp" src={profile?.avatarUrl} alt="Profile Picture" />
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
					isSaving = true;

					return async ({ update }) => {
						await update({ reset: false });
						isSaving = false;
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
						bind:value={displayName}
					/>
				</label>

				<label>
					<p class="caption">Bio</p>
					<textarea
						name="bio"
						placeholder="I'm just a chill guy."
						rows="3"
						autocomplete="off"
						bind:value={bio}
					></textarea>
				</label>

				{#if !displayName}
					<p class="warning center">Display name cannot be empty!</p>
				{:else if isUnsaved}
					<p class="warning center">There are unsaved changes!</p>
				{:else if form?.success}
					<p class="center">Your changes are saved!</p>
				{/if}

				<button disabled={!displayName}>
					{#if isSaving}
						<LoaderCircle class="animate-spin" />
					{:else}
						Save
					{/if}
				</button>
			</form>
		{:else}
			<!-- canvases list render -->
			<div class="canvas_list">
				{#each canvases as canvas (canvas.id)}
					<CanvasCard {canvas} {setCurrCanvas} />
				{/each}

				{#if focusedCanvas}
					<Modal bind:open={isOpen} bind:isSaving canvas={focusedCanvas} />
				{/if}

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

				.center {
					align-self: center;
					margin-top: 10px;
				}

				.warning {
					color: #b11012;
				}
			}
		}
	}
</style>
