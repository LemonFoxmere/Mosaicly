<script lang="ts">
	import { enhance } from "$app/forms";
	import { Archive, ArchiveRestore, LoaderCircle } from "@lucide/svelte";

	let {
		open = $bindable<boolean>(),
		canvas = $bindable<DB.Canvas>(),
		isSaving = $bindable<boolean>()
	}: { open: boolean; canvas: DB.Canvas; isSaving: boolean } = $props();

	let { title, loc_desc, is_archived, id } = $derived(canvas);
</script>

{#if open}
	<div
		class="modal-overlay"
		onclick={() => {
			open = false;
		}}
	>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<form
				method="POST"
				action="/api/canvas?/updateCanvas"
				id="profile_form"
				use:enhance={() => {
					isSaving = true;
					return async ({ update }) => {
						await update({ reset: false });
						isSaving = false;
						open = false;
					};
				}}
			>
				<label>
					<p class="caption">Title</p>
					<input
						name="title"
						placeholder="canvas title"
						autocomplete="off"
						bind:value={title}
					/>
				</label>

				<label>
					<p class="caption">Location description</p>
					<textarea
						name="loc_desc"
						placeholder="location description"
						rows="3"
						autocomplete="off"
						bind:value={loc_desc}
					></textarea>
				</label>

				<input name="is_archived" value={is_archived} type="hidden" />
				<input name="canvas_id" value={id} type="hidden" />

				<div class="action-group">
					<button>
						{#if isSaving}
							<LoaderCircle class="animate-spin" />
						{:else}
							Save
						{/if}
					</button>

					<button formaction="/api/canvas?/toggleArchiveCanvas" class="outline">
						{#if isSaving}
							<LoaderCircle class="animate-spin" />
						{:else if is_archived}
							<ArchiveRestore />
						{:else}
							<Archive />
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		position: relative;
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		max-width: 90%;
		max-height: 90%;
		overflow: auto;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
	}

	.modal-close {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: transparent;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
	}

	.action-group {
		display: flex;
	}
</style>
