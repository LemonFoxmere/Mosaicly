<script lang="ts">
	import FormField from "$lib/comp/ui/general/FormField.svelte";
	import Textarea from "$lib/comp/ui/general/Textarea.svelte";

	interface Props {
		canvasName: string;
		locationDescription: string;
		valid: boolean;
	}
	let {
		canvasName = $bindable(),
		locationDescription = $bindable(),
		valid = $bindable<boolean>(false)
	}: Props = $props();

	// validity checkers
	let nameAccessed = $state(false); // when the user first loads, don't show red.
	const nameMaxLen = 30; // max length of the name
	let nameValid = $derived(!!canvasName && canvasName.length <= nameMaxLen);

	const descMaxLen = 200; // max length of the description
	let descValid = $derived(locationDescription.length <= descMaxLen);

	// effect to update validity
	$effect(() => {
		valid = nameValid && descValid;
	});
</script>

<main>
	<section id="greeting-card">
		<h2>Ready for shitposting?</h2>
		<p>Create a new canvas.</p>
	</section>

	<form id="main-form">
		<FormField
			label={nameValid
				? "Canvas Name"
				: !canvasName
					? "Give it a name"
					: "That's way too long"}
			invalid={!nameValid && nameAccessed}
		>
			<input
				name="canvasName"
				type="text"
				class:invalid={!nameValid && nameAccessed}
				bind:value={canvasName}
				placeholder="My Canvas"
				on:blur={() => {
					nameAccessed = true;
				}}
			/>
		</FormField>

		<FormField
			label={descValid ? "Location Description" : "That's way too long"}
			stretch={true}
			invalid={!descValid}
		>
			<Textarea
				name="bio"
				bind:val={locationDescription}
				placeholder={"Where can people find this canvas?"}
				maxLen={descMaxLen}
				showRemaining={true}
				invalid={!descValid}
			/>
		</FormField>
	</form>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
	@use "$static/stylesheets/fonts";

	main {
		width: 100%;
		height: 100%;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		gap: 15px;

		#greeting-card {
			display: flex;
			flex-direction: column;
			row-gap: 5px;
		}

		#main-form {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 15px;
		}
	}
</style>
