<script lang="ts">
	import { replaceState } from "$app/navigation";
	import CanvasSettings from "$lib/comp/settings/tabContent/CanvasSettings.svelte";
	import ProfileSettings from "$lib/comp/settings/tabContent/ProfileSettings.svelte";
	import { LoaderCircle } from "@lucide/svelte";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	// local state, sync from upstream as updates roll in
	const profile = $derived(data.user?.profile);
	let { displayName } = $derived(data.user!.profile);
	let canvases = $state<DB.Canvas[]>([]); // used to session cache

	// toggle between Profile | Canvases tab
	let editingProfile = $state(true);
	let ready = $state(false);

	const editProfile = () => {
		editingProfile = true;
		// update hash and push history
		replaceState("#profile", {});
	};

	const editCanvas = () => {
		editingProfile = false;
		// update hash and push history
		replaceState("#canvas", {});
	};

	const routeChange = () => {
		// set current step based on URL hash if there is one
		const hash = window.location.hash;

		if (hash && hash.includes("#canvas")) {
			editingProfile = false;
		} else {
			editingProfile = true; // default to editing the profile
		}
	};

	// detect what tab is being requested
	onMount(() => {
		routeChange(); // update editingProfile based on the current hash
		ready = true;
	});
</script>

<svelte:window on:hashchange={routeChange} />

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
	</section>

	<!-- toggle tabs -->
	<section id="main-content">
		{#if ready}
			<section id="tabs-cta">
				<button class={!editingProfile ? "outline" : ""} onclick={editProfile}>
					Profile
				</button>
				<button class={editingProfile ? "outline" : ""} onclick={editCanvas}>
					Canvases
				</button>

				<div id="gradient-bg" />
			</section>

			<section id="edit-content">
				{#if editingProfile}
					<!-- profile render -->
					<ProfileSettings user={data.user} />
				{:else}
					<CanvasSettings user={data.user} bind:canvases />
				{/if}
			</section>
		{:else}
			<div id="loader-container">
				<LoaderCircle size={32} class="animate-spin" />
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
		padding: 5px 30px 25px 30px;
		width: 100%;
		flex-grow: 1;

		display: flex;
		flex-direction: column;
		row-gap: 30px;

		justify-self: center;

		@media screen and (min-width: $mobile-width) {
			margin: auto 0px;
			flex: 1;
			max-height: 700px;
			// padding-bottom: calc(5px + $navbar-height);

			#main-content {
				position: relative;
				overflow-x: hidden;
				overflow-y: auto;

				// hide scrollbar
				-ms-overflow-style: none; /* Internet Explorer 10+ */
				scrollbar-width: none; /* Firefox */
				&::-webkit-scrollbar {
					display: none; /* Safari and Chrome */
				}

				#tabs-cta {
					top: 0px !important;

					#gradient-bg {
						// have to use a bunch of importants here because of ordering
						top: 0px !important;
						height: calc(100% + 20px) !important;
						background: linear-gradient($background-primary, transparent) !important;
					}
				}

				#edit-content {
					height: 100%;
				}
			}
		}

		#intro {
			display: flex;
			flex-direction: column;

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

		#main-content {
			width: 100%;
			height: 100%;

			display: flex;
			flex-direction: column;
			flex-grow: 1;
			row-gap: 20px;

			#tabs-cta {
				position: sticky;
				top: calc($navbar-height + 20px);

				width: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				gap: 10px;

				button {
					width: 100%;
					z-index: 2;
				}

				#gradient-bg {
					position: absolute;
					width: 100vw;
					top: -22px;
					height: calc(100% + 40px);
					background: linear-gradient($background-primary, transparent);
					z-index: 1;
				}
			}

			#edit-content {
				width: 100%;
				display: flex;
				flex-grow: 1;
			}

			#loader-container {
				display: flex;
				flex: 1;
				justify-content: center;
				align-items: center;
			}
		}
	}
</style>
