<script lang="ts">
	let { s = 22 } = $props<{ s?: number }>();
</script>

<svg style="--s: {s}px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
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
