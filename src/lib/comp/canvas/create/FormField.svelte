<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		label,
		required = false,
		labelAction,
		children
	}: {
		label: string;
		required?: boolean;
		stretch?: boolean;
		labelAction?: Snippet; // snippets
		children?: Snippet; // snippets
	} = $props();
</script>

<main>
	<p class="caption">
		{label}{required ? "*" : ""}

		<!-- For any extra fields after the label -->
		{@render labelAction?.()}
	</p>
	{@render children?.()}
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: inherit;
		display: flex;
		flex-direction: column;
		gap: 5px;

		&.stretch {
			height: 100%;
		}
	}
</style>
