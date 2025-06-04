<script lang="ts">
	let { s = 300, debug = false } = $props<{ s?: number }>();
</script>

<main style="--s: {s}px;" class:debug>
	<svg id="grid" viewBox="0 0 253 250" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g>
			<path
				d="M188.585 84.3888L125.973 120.568L188.585 156.747L251.031 120.568L188.585 84.3888Z"
				fill="currentColor"
			/>
			<path
				d="M1.13809 140.423L107.888 201.977M251.138 140.423L144.388 201.977M188.638 156.615L251.138 120.576L188.638 84.5382M188.638 156.615L126.138 192.653L63.6378 156.615M188.638 156.615L63.6379 84.5382M188.638 84.5382L126.138 48.5L63.6379 84.5382M188.638 84.5382L63.6378 156.615M63.6378 156.615L1.13788 120.576L63.6379 84.5382"
				stroke="currentColor"
				stroke-width="2"
				stroke-linejoin="round"
			/>
		</g>
	</svg>

	<svg id="cursor" viewBox="0 0 150 148" fill="none">
		<g>
			<path
				d="M59.0836 147.413L1.02127 0.587296L148.549 58.1508L101.872 79.6792L135.923 113.653L114.344 135.183L80.4383 101.355L59.0836 147.413Z"
				stroke="#964B3C"
				stroke-width="2"
				stroke-linejoin="round"
			/>
		</g>
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

			&#grid {
				z-index: 1;
			}

			&#cursor {
				z-index: 2; // stay on top of the grid
				width: calc(0.5 * $s);

				align-self: flex-end;
				margin-left: calc(-0.25 * $s); // shift left
				margin-bottom: 20px;

				g {
					path {
						fill: $background-primary;
					}
				}
			}
		}
	}
</style>
