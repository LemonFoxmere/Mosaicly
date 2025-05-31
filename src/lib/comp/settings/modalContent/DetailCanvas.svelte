<script lang="ts">
	interface Props {
		opened: boolean;
		canvas: DB.Canvas | undefined;
	}
	let {
		opened: open = $bindable<boolean>(),
		canvas = $bindable<DB.Canvas | undefined>()
	}: Props = $props();

	// extracted canvas data
	let canvasName: string = $derived(canvas?.title ?? "");
	let locDesc = $derived(canvas?.locDesc ?? "");
	let isArchived = $derived(canvas?.isArchived ?? false);
	let backupCode = $derived(canvas?.backupCode ?? false);
	let id = $derived(canvas?.id ?? "");
</script>

<main>
	<a
		id="go-to-canvas"
		class:disabled={isArchived}
		href={isArchived ? "" : `/canvas?c=${backupCode}`}
		target="_blank"
		class="no-drag"
	>
		<button disabled={isArchived}> Open Canvas </button>
	</a>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		display: flex;
		flex-direction: column;
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
	}
</style>
