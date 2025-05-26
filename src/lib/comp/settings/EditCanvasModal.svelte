<script lang="ts">
	import { enhance } from "$app/forms";
	import { CircleCheck, LoaderCircle } from "@lucide/svelte";
	import CrossCircle from "../ui/icons/CrossCircle.svelte";

	let {
		open = $bindable<boolean>(),
		canvas = $bindable<DB.Canvas | undefined>(),
		isSaving = $bindable<boolean>()
	}: { open: boolean; canvas: DB.Canvas | undefined; isSaving: boolean } = $props();

	let title = $state("");
	let locDesc = $state("");
	let isArchived = $state(false);
	let id = $state("");

	let savingData = $state(false);
	let archivingData = $state(false);
	let saveFinished = $state(false);

	$effect(() => {
		if (open) {
			isSaving = false;
			savingData = false;
			archivingData = false;
			saveFinished = false;
		}
	});

	$effect(() => {
		if (canvas) {
			title = canvas.title ?? "";
			locDesc = canvas.locDesc;
			isArchived = canvas.isArchived;
			id = canvas.id;
		}
	});
</script>

<main
	class="no-drag"
	class:hidden={!open}
	onmouseup={() => {
		open = false;
	}}
>
	<div class="modal-content" onmouseup={(e) => e.stopPropagation()}>
		<form
			method="POST"
			action="/api/canvas?/updateCanvas"
			use:enhance={() => {
				isSaving = true;

				return async ({ update }) => {
					// finished callback. Show a checkmark for 500ms and then close
					saveFinished = true;

					setTimeout(async () => {
						await update({ reset: false });
						isSaving = false; // reset states
						open = false;

						setTimeout(() => {
							savingData = false;
							archivingData = false;
							saveFinished = false; // reset after 500ms
						}, 500);
					}, 100);
				};
			}}
		>
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
						<CrossCircle s={42} />
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
						name="loc_desc"
						placeholder="Location Description"
						rows="5"
						autocomplete="off"
						bind:value={locDesc}
					></textarea>
				</label>
			</section>

			<input name="is_archived" value={isArchived} type="hidden" />
			<input name="canvas_id" value={id} type="hidden" />

			<div id="cta">
				<button
					type="submit"
					disabled={isSaving}
					class:full-opacity={savingData}
					onclick={() => {
						savingData = true;
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
					type="submit"
					formaction="/api/canvas?/toggleArchiveCanvas"
					class="outline"
					class:full-opacity={archivingData}
					disabled={isSaving}
					onclick={() => {
						archivingData = true;
					}}
				>
					{#if archivingData}
						{#if saveFinished}
							<CircleCheck size={24} absoluteStrokeWidth={true} strokeWidth={1.5} />
						{:else}
							<LoaderCircle class="animate-spin" />
						{/if}
					{:else if isArchived}
						Unarchive
					{:else}
						Archive
					{/if}
				</button>
			</div>
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

		transition: opacity 700ms $out-generic-expo;

		// no scroll thru
		touch-action: none;
		* {
			touch-action: none;
		}

		&.hidden {
			transition-delay: 400ms;
			opacity: 0;
			pointer-events: none;

			.modal-content {
				opacity: 0;
				transform: scale(0.9);
				transition-timing-function: $in-cubic;
				transition-duration: 300ms;
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
			transition: 700ms $out-generic-expo;
			transition-property: opacity transform;
			transition-delay: 250ms;

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
					}
				}
			}
		}
	}
</style>
