<script lang="ts">
	import { enhance } from "$app/forms";
	import FormField from "$lib/comp/ui/general/FormField.svelte";
	import Textarea from "$lib/comp/ui/general/Textarea.svelte";
	import { LoaderCircle } from "@lucide/svelte";

	let { user = $bindable<DB.AppUser>() } = $props();

	let isSaving = $state(false); // if settings are saving

	let profile: DB.UserProfile = $derived(user.profile); // for typing
	let { displayName, bio } = $derived(profile);

	// consts
	const nameMaxLen = 32;
	const bioMaxLen = 200;

	// state effects
	let dirty = $derived(displayName !== profile.displayName || bio !== profile.bio); // do we have new data
	// input checks
	let nameValid = $derived(!!displayName && displayName.length <= nameMaxLen);
	let bioValid = $derived(bio.length <= bioMaxLen);
	let inputValid = $derived(nameValid && bioValid);
</script>

<form
	method="POST"
	action="/profile?/update_profile"
	use:enhance={() => {
		// set UI effects
		isSaving = true;

		return async ({ update }) => {
			await update({ reset: false });
			isSaving = false;
		};
	}}
>
	<FormField
		label={nameValid
			? "Display Name"
			: !displayName
				? "You can't be nameless"
				: "That's way too long"}
		invalid={!nameValid}
	>
		<input
			name="disp-name"
			type="text"
			placeholder="Guy"
			class:invalid={!nameValid}
			bind:value={displayName}
		/>
	</FormField>

	<FormField label={bioValid ? "Bio" : "That's way too long"} invalid={!bioValid} stretch={true}>
		<Textarea bind:val={bio} maxLen={bioMaxLen} showRemaining={true} invalid={!bioValid} />
	</FormField>

	<button disabled={!(dirty && inputValid)}>
		{#if isSaving}
			<LoaderCircle class="animate-spin" />
		{:else}
			Save
		{/if}
	</button>
</form>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	form {
		width: 100%;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		row-gap: 15px;

		label {
			position: relative;
			display: flex;
			flex-direction: column;
		}

		.warning {
			color: $accent-error;
		}
	}
</style>
