<script lang="ts">
	import type { Provider } from "@supabase/supabase-js";
	import type { SubmitFunction  } from "@sveltejs/kit";
	import { supabase } from "$lib/supabaseClient"
	import { enhance } from "$app/forms";

	const signInWithProvider = async (provider: Provider) => {
		const {data, error: err} = await supabase.auth.signInWithOAuth({
			provider: provider
		})
	}

	const OAUTH_PROVIDERS = ["github", "google", "discord"];
	const submitSocialLogin: SubmitFunction = async ({ action, cancel }) => {
		const provider = action.searchParams.get("provider") as Provider;
		if(OAUTH_PROVIDERS.includes(provider)){
			await signInWithProvider(provider);
		}
		/*
		switch(action.searchParams.get('provider')){
			case "google":
				await signInWithProvider("google");
				break;
			case "discord":
				await signInWithProvider("discord");
				break;
			case "github":
				await signInWithProvider("github");
				break;
			default:
				break;
		}
		*/
		cancel();
	}

</script>

<main>
	<h1> Login </h1>
	<form class="socials" method="post" use:enhance={submitSocialLogin}>
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
