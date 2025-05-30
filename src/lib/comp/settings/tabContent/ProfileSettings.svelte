<script lang="ts">
	import { enhance } from "$app/forms";
	import FormField from "$lib/comp/ui/general/FormField.svelte";
	import Textarea from "$lib/comp/ui/general/Textarea.svelte";
	import { LoaderCircle } from "@lucide/svelte";
	import type { ActionResult } from "@sveltejs/kit";

	interface Props {
		user: DB.AppUser | null | undefined;
	}
	let { user = $bindable<DB.AppUser>() }: Props = $props();

	let isSaving = $state(false); // if settings are saving

	let profile: DB.UserProfile | null = $derived(user?.profile ?? null); // for typing
	let displayName = $derived(profile ? profile.displayName : "");
	let bio = $derived(profile ? profile.bio : "");

	// consts
	const nameMaxLen = 32;
	const bioMaxLen = 200;

	// state effects
	let dirty = $derived(
		profile ? displayName !== profile.displayName || bio !== profile.bio : false
	); // do we have new data
	// input checks
	let nameValid = $derived(!!displayName && displayName.length <= nameMaxLen);
	let bioValid = $derived(bio.length <= bioMaxLen);
	let inputValid = $derived(nameValid && bioValid);

	const submitCallback = () => {
		// set UI effects
		isSaving = true;

		return async ({
			update
		}: {
			formData: FormData;
			result: ActionResult;
			update: (opts?: any) => Promise<void>;
		}) => {
			await update({ reset: false });
			isSaving = false;
		};
	};
</script>

<form class="no-drag" method="POST" action="/profile?/update_profile" use:enhance={submitCallback}>
	<FormField
		label={nameValid
			? "Display Name"
			: !displayName
				? "You can't be nameless"
				: "That's way too long"}
		invalid={!nameValid}
	>
		<input
			name="displayName"
			type="text"
			placeholder="Guy"
			class:invalid={!nameValid}
			bind:value={displayName}
		/>
	</FormField>

	<FormField label={bioValid ? "Bio" : "That's way too long"} invalid={!bioValid} stretch={true}>
		<Textarea
			bind:val={bio}
			name={"bio"}
			placeholder={"Just a chill guy."}
			maxLen={bioMaxLen}
			showRemaining={true}
			invalid={!bioValid}
		/>
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
