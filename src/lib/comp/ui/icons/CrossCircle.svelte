<script lang="ts">
	let { s = 22 } = $props<{ s?: number }>();
</script>

<svg
	style="--s: {s}px;"
	fill="none"
	viewBox="0 0 24 24"
	stroke-width="0.75"
	stroke="currentColor"
	class="size-6"
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
	/>
</svg>

<style lang="scss">
	$s: var(--s);

	svg {
		width: $s;
		height: $s;
		color: inherit;
	}
</style>
