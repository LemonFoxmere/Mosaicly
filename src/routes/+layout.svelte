<script lang="ts">
	import Logo from "$lib/comp/ui/icons/Logo.svelte";
	let { children } = $props();
</script>

<main>
	<nav>
		<!-- <button class="small">Log in</button> -->
		<a class="wrapper" href="/">
			<div id="logo"><Logo s={28} /></div>
		</a>
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
			justify-content: center; // will change in the future when we have a login button
			align-items: center;
			// padding: 10px 30px;

			width: 100%;
			max-width: 700px;
			min-height: 60px;
			height: 60px;

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
