<script lang="ts">
	let { s = 22 } = $props<{ s?: number }>();
</script>

<svg
	style="--s: {s}px;"
	viewBox="0 0 24 24"
	stroke="currentColor"
	stroke-width="1.25px"
	fill="none"
>
	<path
		d="M18.3476 12C18.3476 15.5055 15.5058 18.3473 12.0003 18.3473C8.49474 18.3473 5.65295 15.5055 5.65295 12C5.65295 8.49447 8.49474 5.65268 12.0003 5.65268C15.5058 5.65268 18.3476 8.49447 18.3476 12Z"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path d="M20.8476 12L14.8476 12" stroke-linecap="round" stroke-linejoin="round" />
	<path d="M9.15295 12L3.15295 12" stroke-linecap="round" stroke-linejoin="round" />
	<path d="M12.0003 9.15268L12.0003 3.15268" stroke-linecap="round" stroke-linejoin="round" />
	<path d="M12.0003 20.8473L12.0003 14.8473" stroke-linecap="round" stroke-linejoin="round" />
</svg>

<style lang="scss">
	$s: var(--s);

	svg {
		width: $s;
		height: $s;
		color: inherit;
	}
</style>
