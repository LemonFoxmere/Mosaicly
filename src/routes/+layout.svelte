<script lang="ts">
	import Mosaicly from "$lib/comp/ui/logos/MosaiclyLogo.svelte";
	import type { PageData, Snippet } from "./$types";

	let { children, data }: { children: Snippet; data: PageData } = $props();
	let { showLogo, showCta } = $derived(data.appearance);
	let session = $derived(data.session);
	let user = $derived(data.user);

	$effect(() => {
		if (user) {
			console.log(user);
		}
	});
</script>

<main>
	<nav>
		<!-- <button class="small">Log in</button> -->
		{#if showLogo}
			<a class="wrapper item" href="/">
				<div id="logo"><Mosaicly s={28} /></div>
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
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;

		nav {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

			padding: 0px 30px;

			width: 100%;
			max-width: 700px;
			min-height: 60px;
			height: 60px;

			*:only-child {
				margin: 0 auto;
			}

			.item {
				width: 28px;
				height: 28px;

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
