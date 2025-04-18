<script lang="ts">
	import LoadingSpinner from "$lib/comp/ui/general/LoadingSpinner.svelte";
</script>

<main>
	<LoadingSpinner />
	<h1> Login </h1>
	<form class="socials" method="POST">
		<button formaction="?/login&provider=github" class="oAuth">Github</button>
		<button formaction="?/login&provider=discord" class="oAuth">Discord</button>
		<button formaction="?/login&provider=google" class="oAuth">Google</button>
	</form>
</main>

<style lang="scss">
	@import "$static/stylesheets/guideline";

	main {
		width: 100%;
		height: 100%;

		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
