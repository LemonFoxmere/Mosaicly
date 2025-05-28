<script lang="ts">
	import { enhance } from "$app/forms";
	import { CircleCheck, LoaderCircle } from "@lucide/svelte";
	import type { ActionResult } from "@sveltejs/kit";
	import CrossCircle from "../ui/icons/CrossCircle.svelte";

	let {
		open = $bindable<boolean>(),
		canvas = $bindable<DB.Canvas | undefined>()
	}: { open: boolean; canvas: DB.Canvas | undefined } = $props();

	let title = $derived(canvas?.title ?? "");
	let origTitle = $derived(canvas?.title ?? "");
	let locDesc = $derived(canvas?.locDesc ?? "");
	let origLocDesc = $derived(canvas?.locDesc ?? "");
	let isArchived = $derived(canvas?.isArchived ?? false);
	let id = $derived(canvas?.id ?? "");
	let hasUnsavedChanges = $derived(title !== origTitle || locDesc !== origLocDesc); // if the user has unsaved changes

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

	let forceOpen = $state(false); // stupid UI shit to prevent the window from closing when user is dragging text

	let archiveHasSecondClick = $state(false); // confirm before archiving
	let savingData = $state(false);
	let archivingData = $state(false);
	let saveFinished = $state(false);

	const resetUISavingState = () => {
		// reset all UI states
		savingData = false;
		archivingData = false;
		saveFinished = false;
	};

	$effect(() => {
		if (open) {
			resetUISavingState();
			errorStatus = {
				flag: false,
				message: ""
			};
			archiveHasSecondClick = false;
		}
	});

	const submitCallback = () => {
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

<main
	class="no-drag"
	class:hidden={!open}
	onmouseup={() => {
		if (!forceOpen) {
			open = false;
		}
		forceOpen = false;
	}}
>
	<div
		class="modal-content"
		onmouseup={(e) => e.stopPropagation()}
		onmousedown={() => {
			forceOpen = true;
		}}
		onclick={() => {
			// cancel archive button second click
			archiveHasSecondClick = false;
		}}
	>
		<form method="POST" use:enhance={submitCallback}>
			<section id="main-content">
				<section id="title-container">
					<p class="title">Editing "{title}"</p>

					<button
						type="button"
						class="none"
						onclick={() => {
							open = false;
						}}
					>
						<CrossCircle s={48} />
					</button>
				</section>

				<label class="input-container">
					<p class="caption">Title</p>
					<input
						name="title"
						placeholder="Canvas Title"
						autocomplete="off"
						bind:value={title}
					/>
				</label>

				<label class="input-container">
					<p class="caption">Location description</p>
					<textarea
						name="locDesc"
						placeholder="Location Description"
						rows="5"
						autocomplete="off"
						bind:value={locDesc}
					></textarea>
				</label>
			</section>

			<!-- this stores the CURRENT state of the archieved state.
			The toggle function basically takes this and inverts it -->
			<input name="isArchived" value={isArchived} type="hidden" />
			<!-- hidden canvasID input that can be sent to the form as
			a parameter to be used -->
			<input name="canvasId" value={id} type="hidden" />

			<section id="cta-container">
				{#if errorStatus.flag}
					<p id="error-msg">{errorStatus.message}</p>
				{/if}
				{#if archiveHasSecondClick}
					<p id="error-msg">
						Are you sure you want to archive this canvas? Doing so will prevent others
						from seeing or accessing it.
					</p>
				{/if}

				<div id="cta">
					<button
						type="submit"
						formaction="/api/canvas?/updateCanvas"
						disabled={!hasUnsavedChanges || savingData || archivingData}
						class:full-opacity={savingData}
						onclick={() => {
							setTimeout(() => {
								// prevent the disabled flag from stopping data being sent
								savingData = true;
							}, 0);
						}}
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

					<button
						formaction={"/api/canvas?/toggleArchiveState"}
						class="outline"
						class:full-opacity={archivingData}
						class:warn={archiveHasSecondClick}
						disabled={archivingData || savingData}
						onclick={(e) => {
							if (archiveHasSecondClick || isArchived) {
								// allow if we have a second click or we're trying to unarchive
								setTimeout(() => {
									// prevent the disabled flag from stopping data being sent
									archivingData = true;
									archiveHasSecondClick = false;
								}, 0);
							} else {
								// require a second click
								e.preventDefault();
								setTimeout(() => {
									// prevent root cancel event from overriding this
									archiveHasSecondClick = true;
								}, 0);
							}
						}}
					>
						{#if archivingData}
							{#if saveFinished}
								<CircleCheck
									size={24}
									absoluteStrokeWidth={true}
									strokeWidth={1.5}
								/>
							{:else}
								<LoaderCircle class="animate-spin" />
							{/if}
						{:else if isArchived}
							Unarchive
						{:else}
							{archiveHasSecondClick ? "Yes I'm Sure" : "Archive"}
						{/if}
					</button>
				</div>
			</section>
		</form>
	</div>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		@extend .glass-light;

		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		padding: 15px;

		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 110;

		transition: opacity 500ms $out-generic-expo;

		// no scroll thru
		touch-action: none;
		* {
			touch-action: none;
		}

		&.hidden {
			transition-delay: 200ms;
			opacity: 0;
			pointer-events: none;

			.modal-content {
				opacity: 0;
				transform: translateY(50px);
				// transform: scale(0.9);
				transition-timing-function: $in-quad !important;
				transition-duration: 300ms !important;
				transition-delay: 0ms !important;
			}
		}

		.modal-content {
			@extend .item-frame;

			position: relative;
			background-color: $background-primary;
			padding: 30px;

			width: 100%;
			max-width: 700px;

			opacity: 1;
			transition: 500ms $out-generic-expo;
			transition-property: opacity transform;
			transition-delay: 200ms;

			form {
				display: flex;
				flex-direction: column;
				row-gap: 30px;

				#main-content {
					display: flex;
					flex-direction: column;
					row-gap: 15px;
					width: 100%;

					#title-container {
						display: flex;
						flex-direction: row;
						justify-content: space-between;
						column-gap: 20px;

						button {
							cursor: pointer;
						}
					}

					.input-container {
						width: 100%;
						display: flex;
						flex-direction: column;
						row-gap: 5px;

						input {
							width: 100%;
						}

						textarea {
							width: 100%;
							display: block;
							resize: none;
						}
					}
				}

				#cta-container {
					width: 100%;
					display: flex;
					flex-direction: column;
					row-gap: 15px;

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
		}
	}
</style>
