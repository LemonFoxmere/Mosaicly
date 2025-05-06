<script lang="ts">
	import MosaiclyLogo from "$lib/comp/ui/logos/MosaiclyLogo.svelte";
	import { onMount } from "svelte";
	import type { PageData } from "./$types";

	let { children, data }: { children: any; data: PageData } = $props();
	let { showLogo, showCta } = $derived(data.appearance);
	let session = $derived(data.session);
	let user = $derived(data.user);

	let navbar: HTMLElement;
	let observer: IntersectionObserver;

	onMount(() => {
		observer = new IntersectionObserver(
			([e]) => e.target.classList.toggle("is-at-top", e.intersectionRatio >= 1),
			{ threshold: [1] }
		);

		observer.observe(navbar);
	});

	$effect(() => {
		if (user) {
			console.log(user);
		}
	});
</script>

<main>
	<nav bind:this={navbar} id="navbar" class="no-drag is-at-top">
		<!-- <button class="small">Log in</button> -->
		{#if showLogo}
			<a class="wrapper item" href="/">
				<div id="logo"><MosaiclyLogo s={28} /></div>
				<!-- <p id="logo-text">mosaicly</p> -->
			</a>
		{/if}
		{#if showCta}
			{#if !session}
				<a class="wrapper item" href="/login">
					<button class="small">Log in</button>
				</a>
			{:else}
				<a class="wrapper item large" href="/profile">
					<!-- TODO: replace with profile pic -->
					{#if user?.profile?.avatarUrl}
						<img src={user.profile.avatarUrl} alt="Profile Picture" id="pfp" />
					{:else}
						<button class="small outline">Profile</button>
					{/if}
				</a>
			{/if}
		{/if}
	</nav>

	<div id="content">
		{@render children()}
	</div>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		// border: 1px solid blue;
		width: 100%;
		min-height: 100%;
		height: fit-content;

		display: flex;
		flex-direction: column;
		align-items: center;

		#logo-text {
			font-weight: 500;
			font-size: 22px;
			color: $text-primary;
		}

		#navbar {
			background-color: $background-primary;

			position: sticky;
			top: -1px;

			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

			padding: 2.5px 30px 0px 30px;

			width: 100%;
			max-width: 700px;
			min-height: 60px;
			height: $navbar-height;

			border-bottom: 1.5px solid $text-tertiary;
			transition: border-color 500ms $out-generic-expo;

			&.is-at-top {
				padding: 1px 30px 0px 30px;
				border-bottom: 1.5px solid transparent;
			}

			*:only-child {
				margin: 0 auto;
			}

			.item {
				display: flex;
				justify-content: center;
				align-items: center;

				&.large {
					width: 42px;
					height: 42px;
				}
			}

			#pfp {
				width: 100%;
				height: 100%;
				border-radius: 100px;
				object-fit: cover;
			}

			#logo {
				color: $text-primary;
			}
		}

		#content {
			display: flex;
			flex-grow: 1;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;

			width: 100%;
			height: 100%;
			max-width: 700px;
		}

		@media screen and (min-width: $mobile-width) {
			justify-content: center;
		}
	}
</style>
