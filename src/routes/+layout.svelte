<script lang="ts">
	import Mosaicly from "$lib/comp/ui/logos/MosaiclyLogo.svelte";

	let { children, data } = $props();
	let { showLogo, showCta } = $derived(data.apperance);
</script>

<main>
	<nav>
		<!-- <button class="small">Log in</button> -->
		{#if showLogo}
			<a class="wrapper" href="/">
				<div id="logo"><Mosaicly s={28} /></div>
			</a>
		{/if}
		{#if showCta}
			<a class="wrapper" href="/login">
				<button class="small">Log in</button>
			</a>
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
