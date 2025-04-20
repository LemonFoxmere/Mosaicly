<script lang="ts">
	import DiscordLogo from "$lib/comp/ui/logos/DiscordLogo.svelte";
	import GithubLogo from "$lib/comp/ui/logos/GithubLogo.svelte";
	import GoogleLogo from "$lib/comp/ui/logos/GoogleLogo.svelte";
</script>

<main>
	<section id="titles">
		<h1 id="title">Log In.</h1>
		<p id="sub"><strong>We knew you'd come back for more.</strong></p>
	</section>

	<section id="oauth-form">
		<p>
			Choose one of the platforms below to continue signing in. If you don't have an account
			yet, done worry — one will be created for you.
		</p>

		<!-- oauth selector -->
		<form id="logos" method="post">
			<button id="google" formaction="?/signup&provider=google">
				<GoogleLogo s={22} />
			</button>
			<button id="discord" formaction="?/signup&provider=discord">
				<DiscordLogo s={24} />
			</button>
			<button id="twitter" formaction="?/signup&provider=twitter">
				<GithubLogo s={24} />
			</button>
		</form>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: calc(100% - $navbar-height);
		padding: 0px 30px;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		row-gap: 30px;

		#titles {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 10px;
		}

		#oauth-form {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 15px;

			#logos {
				display: flex;
				column-gap: 10px;

				button {
					width: 100%;
				}
			}
		}
	}
</style>
