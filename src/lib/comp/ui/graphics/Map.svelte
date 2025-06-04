<script lang="ts">
	let { s = 300, debug = false } = $props<{ s?: number }>();
</script>

<main style="--s: {s}px;" class:debug>
	<svg viewBox="0 0 373 384">
		<path
			d="M124.162 64.9633V380.846L2.98523 319.036V3.15271L124.162 64.9633Z"
			stroke="#964B3C"
			stroke-width="2"
		/>
		<path
			d="M247.338 319.036L126.162 380.846V64.9623L247.338 3.15369V319.036Z"
			stroke="#964B3C"
			stroke-width="2"
		/>
		<path
			d="M370.515 64.9623V380.845L249.339 319.036V3.15271L370.515 64.9623Z"
			stroke="#964B3C"
			stroke-width="2"
		/>
		<path
			d="M125.162 64.3511L1.98523 1.52087V319.648L125.162 382.479M125.162 64.3511V382.479M125.162 64.3511L248.339 1.52087M125.162 382.479L248.339 319.648M248.339 1.52087V319.648M248.339 1.52087L371.515 64.3511V382.479L248.339 319.648"
			stroke="#964B3C"
			stroke-width="2"
			stroke-linejoin="round"
		/>
	</svg>
</main>

<!-- fill="#EC7948" -->

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	$s: var(--s);

	main {
		width: fit-content;
		height: fit-content;
		display: flex;

		&.debug {
			border: 1px solid white;
		}

		svg {
			width: $s;
			height: auto;
			color: inherit;

			fill: $background-primary;
		}
	}
</style>
