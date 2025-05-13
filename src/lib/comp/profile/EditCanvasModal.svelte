<script lang="ts">
	let {
		open = $bindable<boolean>(),
		canvas
	}: {
		open: boolean;
		canvas: DB.Canvas;
	} = $props();
</script>

{#if open}
	<div
		class="modal-overlay"
		onclick={() => {
			open = false;
		}}
	>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			{canvas.id}
			{canvas.title}
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
</style>
