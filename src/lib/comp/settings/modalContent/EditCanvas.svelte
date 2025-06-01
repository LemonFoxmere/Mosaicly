<script lang="ts">
	import { enhance } from "$app/forms";
	import { CircleCheck, LoaderCircle } from "@lucide/svelte";
	import type { ActionResult } from "@sveltejs/kit";
	import FormField from "../../ui/general/FormField.svelte";
	import Textarea from "../../ui/general/Textarea.svelte";

	interface Props {
		opened: boolean;
		canvas: DB.Canvas | undefined;
		editedTitle?: string; // passed up
	}
	let {
		opened: open = $bindable<boolean>(),
		canvas = $bindable<DB.Canvas | undefined>(),
		editedTitle = $bindable<string>("")
	}: Props = $props();

	// extracted canvas data
	let canvasName = $derived(canvas?.title ?? "");
	let origCanvasName = $derived(canvas?.title ?? "");
	let locDesc = $derived(canvas?.locDesc ?? "");
	let origLocDesc = $derived(canvas?.locDesc ?? "");
	let isArchived = $derived(canvas?.isArchived ?? false);
	let id = $derived(canvas?.id ?? "");
	let hasUnsavedChanges = $derived(canvasName !== origCanvasName || locDesc !== origLocDesc); // if the user has unsaved changes

	// effect change on editedTitle
	$effect(() => {
		editedTitle = canvasName;
	});

	// component bindings
	let formSaveButton: HTMLButtonElement;

	// any error messages that pops up
	let errorStatus = $state({
		flag: false,
		message: ""
	});
	const showErr = (message: string) => {
		errorStatus.flag = true;
		errorStatus.message = message;
		resetUISavingState();
		open = true; // open modal if not already open
	};

	let archiveHasSecondClick = $state(false); // confirm before archiving
	let savingData = $state(false); // whether or not to show spinner on save button
	let archivingData = $state(false); // whether or not to show spinner on archive button
	let saveFinished = $state(false); // show checkmark instead of spinner?

	// validity checkers
	const nameMaxLen = 30; // max length of the description
	let nameValid = $derived(!!canvasName && canvasName.length <= nameMaxLen);
	const descMaxLen = 200; // max length of the description
	let descValid = $derived(locDesc.length <= descMaxLen);
	let valid = $derived(nameValid && descValid); // overall validity (for submission)

	const resetUISavingState = () => {
		// reset all UI states
		savingData = false;
		archivingData = false;
		saveFinished = false;
	};

	$effect(() => {
		// effect to run upon opening (reset state basically)
		if (open) {
			resetUISavingState(); // reset all UI states
			errorStatus = {
				// clear errors
				flag: false,
				message: ""
			};
			archiveHasSecondClick = false; // reset second click
		}
	});

	const saveChanges = (e: MouseEvent) => {
		void e;
		savingData = true;
		// trigger the formSaveButton
		if (formSaveButton) {
			formSaveButton.click();
		} else {
			showErr("Failed to save changes. Please reload and try again.");
			resetUISavingState();
		}
	};

	const submitCallback = () => {
		// called upon finishing submission
		return async ({
			result
		}: {
			formData: FormData;
			result: ActionResult;
			update: (opts?: any) => Promise<void>;
		}) => {
			if (result.type === "error") {
				showErr(result.error?.message);
			} else if (result.type === "failure") {
				showErr(result.data?.message);
			} else if (result.type === "success") {
				// finished callback. Update data and show a checkmark for 200ms
				if (canvas && result.data) {
					canvas.title = result.data.canvas.title;
					canvas.locDesc = result.data.canvas.loc_desc;
					canvas.isArchived = result.data.canvas.is_archived;
				}
				saveFinished = true;

				setTimeout(async () => {
					// reset states
					open = false;
					setTimeout(() => {
						resetUISavingState(); // reset after 500ms
					}, 500);
				}, 200);
			}
		};
	};
</script>

<form method="POST" use:enhance={submitCallback}>
	<section id="input-container">
		<FormField
			label={nameValid
				? "Canvas Name"
				: !canvasName
					? "Give it a name"
					: "That's way too long"}
			invalid={!nameValid}
		>
			<input
				type="text"
				name={"canvasName"}
				class:invalid={!nameValid}
				bind:value={canvasName}
				placeholder="My Canvas"
			/>
		</FormField>

		<FormField
			label={descValid ? "Location Description" : "That's way too long"}
			stretch={true}
			invalid={!descValid}
		>
			<Textarea
				bind:val={locDesc}
				name={"locDesc"}
				placeholder={"Where can people find this canvas?"}
				maxLen={descMaxLen}
				rows={5}
				showRemaining={true}
				invalid={!descValid}
			/>
		</FormField>
	</section>

	<section id="cta-container">
		<!-- show error message? -->
		{#if errorStatus.flag}
			<p id="error-msg">{errorStatus.message}</p>
		{/if}
		{#if archiveHasSecondClick}
			<p id="error-msg">
				Are you sure? Archiving this canvas will stop others from seeing or accessing it.
			</p>
		{/if}

		<div id="cta">
			<button
				type="submit"
				disabled={!hasUnsavedChanges || savingData || archivingData || !valid}
				class:full-opacity={savingData}
				onclick={saveChanges}
			>
				{#if savingData}
					{#if saveFinished}
						<CircleCheck size={24} absoluteStrokeWidth={true} strokeWidth={2} />
					{:else}
						<LoaderCircle class="animate-spin" />
					{/if}
				{:else}
					Save
				{/if}
			</button>
			<!-- the actual form submission button (pressed by TS) -->
			<button
				bind:this={formSaveButton}
				type="submit"
				formaction="/api/canvas?/updateCanvas"
				class="hidden"
			/>
		</div>
	</section>

	<!-- ===================== HIDDEN FORM DATA ===================== -->

	<!-- hidden canvasID input that can be sent to the form as
	a parameter to be used -->
	<input name="canvasId" value={id} type="hidden" />
</form>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	form {
		display: flex;
		flex-direction: column;
		row-gap: 30px;

		#input-container {
			display: flex;
			flex-direction: column;
			row-gap: 15px;
			width: 100%;
		}

		#cta-container {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 15px;

			button {
				white-space: nowrap;
			}

			#error-msg {
				width: 100%;
				text-align: center;
				color: $accent-error;
			}

			#cta {
				display: flex;
				flex-direction: row;
				width: 100%;
				column-gap: 10px;

				button {
					width: 100%;

					&.full-opacity {
						opacity: 1 !important; // override disabled
					}

					&.warn {
						border-color: $accent-error;
						color: $accent-error;
					}
				}
			}
		}
	}
</style>
