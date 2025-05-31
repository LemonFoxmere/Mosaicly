<script lang="ts" context="module">
	// helper for date
	const dateOptions: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour12: true
	};
	const formatDate = (date: string | Date) => {
		const d = typeof date === "string" ? new Date(date) : date;
		return d.toLocaleString("en-US", dateOptions).replace(" at", " @");
	};
</script>

<script lang="ts">
	import { enhance } from "$app/forms";
	import Document from "$lib/comp/ui/icons/Document.svelte";
	import Image from "$lib/comp/ui/icons/Image.svelte";
	import { CircleCheck, LoaderCircle } from "@lucide/svelte";
	import type { ActionResult } from "@sveltejs/kit";

	interface Props {
		opened: boolean;
		canvas: DB.Canvas | undefined;
		canvasList: DB.Canvas[] | undefined;
	}
	let {
		opened: open = $bindable<boolean>(),
		canvas = $bindable<DB.Canvas | undefined>(),
		canvasList = $bindable<DB.Canvas[]>()
	}: Props = $props();

	// binded components
	let formArchiveButton: HTMLButtonElement;
	let formDeleteButton: HTMLButtonElement;

	// extracted canvas data
	let canvasName: string = $derived(canvas?.title ?? "");
	let locDesc = $derived(canvas?.locDesc ?? "");
	let isArchived = $derived(canvas?.isArchived ?? false);
	let backupCode = $derived(canvas?.backupCode ?? false);
	let createdOn = $derived(formatDate(canvas?.createdOn ?? ""));
	let id = $derived(canvas?.id ?? "");

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

	// UI states
	let archiveHasSecondClick = $state(false); // confirm before archiving
	let deleteHasSecondClick = $state(false); // confirm before deleting

	let archivingData = $state(false); // whether or not to show spinner on archive button
	let deletingData = $state(false); // whether or not to show spinner on save button
	let saveFinished = $state(false); // show checkmark instead of spinner?

	let selectedAction = $state<"archive" | "delete" | null>(null);

	const resetUISavingState = () => {
		// reset all UI states
		deletingData = false;
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
			deleteHasSecondClick = false; // reset second click
			selectedAction = null; // reset selected action
		}
	});

	// Form action buttons
	const toggleArchive = (e: MouseEvent) => {
		if (archiveHasSecondClick || isArchived) {
			// allow if we have a second click or we're trying to unarchive
			archivingData = true;
			archiveHasSecondClick = false; // reset second click state
			selectedAction = "archive"; // set state for processing
			// trigger the formArchiveButton
			if (formArchiveButton) {
				formArchiveButton.click();
			} else {
				showErr("Failed to archive canvas. Please reload and try again.");
				resetUISavingState();
			}
		} else {
			// require a second click
			e.preventDefault();
			setTimeout(() => {
				archiveHasSecondClick = true;
				deleteHasSecondClick = false;
			});
		}
	};

	const deleteCanvas = (e: MouseEvent) => {
		if (deleteHasSecondClick) {
			// allow if we have a second click
			deletingData = true;
			deleteHasSecondClick = false; // reset second click state
			selectedAction = "delete"; // set state for processing
			// trigger the formArchiveButton
			if (formDeleteButton) {
				formDeleteButton.click();
			} else {
				showErr("Failed to delete canvas. Please reload and try again.");
				resetUISavingState();
			}
		} else {
			// require a second click
			e.preventDefault();
			setTimeout(() => {
				deleteHasSecondClick = true;
				archiveHasSecondClick = false;
			});
		}
	};

	// submission callback (for UI updates)
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
				if (selectedAction === "delete") {
					// delete this canvas from the list
					if (canvasList && canvas) {
						const index = canvasList.findIndex((c) => c.id === canvas.id);
						if (index !== -1) {
							canvasList.splice(index, 1); // remove from list
						}
					}
				} else {
					// by default, update canvas information and exit
					if (canvas && result.data) {
						canvas.title = result.data.canvas.title;
						canvas.locDesc = result.data.canvas.loc_desc;
						canvas.isArchived = result.data.canvas.is_archived;
					}
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

<!-- Hidden form for sending data -->
<form id="hidden-form" method="POST" use:enhance={submitCallback}>
	<!-- hidden canvasID input that can be sent to the form as
	a parameter to be used -->
	<input name="canvasId" value={id} type="hidden" />

	<!-- this stores the CURRENT state of the Archived state.
	The toggle function basically takes this and inverts it -->
	<input name="isArchived" value={isArchived} type="hidden" />
	<!-- Archive canvas -->
	<button bind:this={formArchiveButton} formaction="/api/canvas?/toggleArchiveState" />

	<!-- Delete canvas -->
	<button bind:this={formDeleteButton} formaction="/api/canvas?/deleteCanvas" />
</form>

<main
	onclick={() => {
		// reset all second clicks
		archiveHasSecondClick = false;
		deleteHasSecondClick = false;
	}}
>
	<section class="content-container" id="details">
		<p>Location Description: <strong>{locDesc}</strong></p>
		<p>Canvas Code: <strong>{backupCode}</strong></p>
		<p>Created On: <strong>{createdOn}</strong></p>

		<p>QR Codes:</p>
		<section id="cta">
			<section id="cta">
				<button class="outline">
					<Image s={22} />
				</button>
				<button class="outline">
					<Document s={22} />
				</button>
			</section>
		</section>
	</section>

	<section class="content-container" id="actions">
		<p class="caption">Canvas Actions</p>
		<section id="cta">
			<!-- Open the canvas -->
			<a
				id="go-to-canvas"
				class:disabled={isArchived || archivingData || deletingData}
				href={isArchived ? "" : `/canvas?c=${backupCode}`}
				target="_blank"
				class="no-drag"
			>
				<button disabled={isArchived || archivingData || deletingData}>
					Open Canvas
				</button>
			</a>

			<!-- Archive -->
			<button
				class="outline"
				class:full-opacity={archivingData}
				class:warn={archiveHasSecondClick}
				disabled={archivingData || deletingData}
				onclick={toggleArchive}
			>
				{#if archivingData}
					{#if saveFinished}
						<CircleCheck size={24} absoluteStrokeWidth={true} strokeWidth={1.5} />
					{:else}
						<LoaderCircle class="animate-spin" />
					{/if}
				{:else if isArchived}
					Unarchive Canvas
				{:else}
					{archiveHasSecondClick ? "Tap Again to Confirm" : "Archive Canvas"}
				{/if}
			</button>

			<!-- Delete -->
			<button
				id="delete"
				class="none warn"
				class:full-opacity={deletingData}
				class:warn={deleteHasSecondClick}
				disabled={archivingData || deletingData}
				onclick={deleteCanvas}
			>
				{#if deletingData}
					{#if saveFinished}
						<CircleCheck size={24} absoluteStrokeWidth={true} strokeWidth={1.5} />
					{:else}
						<LoaderCircle class="animate-spin" />
					{/if}
				{:else}
					<p>
						{deleteHasSecondClick
							? "Are You Sure? Tap Again to Confirm"
							: "Delete Permanently"}
					</p>
				{/if}
			</button>
		</section>
	</section>

	{#if errorStatus.flag}
		<p class="err-msg">{errorStatus.message}</p>
	{/if}
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		display: flex;
		flex-direction: column;
		row-gap: 30px;

		width: 100%;
		height: 100%;

		#go-to-canvas {
			width: 100%;
			text-decoration: none;

			&.disabled {
				pointer-events: none;
			}

			button {
				width: 100%;
			}
		}

		.content-container {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 5px;
			&#details {
				display: flex;
				flex-direction: column;
				row-gap: 5px;

				#cta {
					width: 100%;
					display: flex;
					column-gap: 10px;

					button {
						width: 100%;
						padding: 35px 0px;

						// display: flex;
						// flex-direction: column;
						// row-gap: 0px;
					}
				}
			}

			&#actions {
				#cta {
					display: flex;
					flex-direction: column;
					align-items: center;
					row-gap: 10px;

					button {
						width: 100%;

						&.warn {
							border-color: $accent-error;
							color: $accent-error;

							&#delete {
								p {
									color: $accent-error;
								}
							}
						}

						&#delete {
							width: fit-content;

							display: flex;
							justify-content: center;
							align-items: center;
							padding: 10px 15px;

							p {
								text-decoration: underline;
								color: $text-tertiary;
							}

							&:active {
								background-color: rgba($accent-error, 0.3);
								p {
									text-decoration: underline;
									color: $accent-error;
								}
							}
						}
					}
				}
			}
		}
	}

	.err-msg {
		width: 100%;
		text-align: center;
		color: $accent-error;
	}

	#hidden-form {
		display: none;
		pointer-events: none;
	}
</style>
