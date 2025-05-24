<script lang="ts">
	import { enhance } from "$app/forms";
	import { LoaderCircle } from "@lucide/svelte";

	let { user = $bindable<DB.AppUser>() } = $props();

	let isSaving = $state(false); // if settings are saving

	let profile: DB.UserProfile = $derived(user.profile); // for typing
	let { displayName, bio } = $derived(profile);

	// consts
	const bioMaxLen = 200;

	// state effects
	let dirty = $derived(displayName !== profile.displayName || bio !== profile.bio); // do we have new data
	// input checks
	let nameValid = $derived(!!displayName && displayName.length <= 50);
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
	<label class:invalid={!nameValid}>
		<p class="caption">
			{#if nameValid}
				Display Name
			{:else if !displayName}
				You can't be nameless
			{:else}
				That's way too long
			{/if}
		</p>
		<input
			name="disp-name"
			type="text"
			placeholder="Guy"
			autocomplete="off"
			bind:value={displayName}
		/>
	</label>

	<label class="grow" class:invalid={!bioValid}>
		<p class="caption">
			{#if bioValid}
				Bio
			{:else}
				That's way too long
			{/if}
		</p>
		<textarea
			name="bio"
			placeholder="I'm just a chill guy."
			rows="3"
			autocomplete="off"
			bind:value={bio}
		/>
		<p id="character-ct">{bioMaxLen - bio.length}</p>
	</label>

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

			* {
				// for all children
				transition: 150ms $out-generic;
				transition-property: color, border-color, opacity;
			}

			textarea {
				height: 100%;
				display: flex;
			}

			#character-ct {
				position: absolute;
				text-align: right;
				right: 1.5px;
				bottom: 4px;
				padding: 7px 15px;

				background-color: $background-primary;
				border-bottom-right-radius: 8px;
				border-top-left-radius: 8px;
			}

			&.grow {
				flex-grow: 1;
			}
			&.invalid {
				p {
					color: $accent-error;
				}
				input {
					color: $accent-error;
					border-color: $accent-error;

					&::placeholder {
						color: $accent-error;
					}
				}
				textarea {
					color: $accent-error;
					border-color: $accent-error;
				}
			}
		}

		.warning {
			color: $accent-error;
		}
	}
</style>
