<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		galleryIndex: number;
		startVisIdx: number;
		endVisIdx: number;
		children: Snippet;
	}
	let { galleryIndex, startVisIdx, endVisIdx, children }: Props = $props();

	let hideLeft: boolean = $derived(galleryIndex >= endVisIdx);
	let hideRight: boolean = $derived(galleryIndex < startVisIdx);
	let hidden: boolean = $derived(hideLeft || hideRight);
</script>

<main class={`${hidden ? "hidden" : ""} ${hideLeft ? "left" : ""} ${hideRight ? "right" : ""}`}>
	{@render children?.()}
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		position: absolute;

		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		opacity: 1;
		position: absolute;
		transform: translate(0px, 0px);

		transition:
			transform 500ms $out-generic-expo,
			opacity 500ms $out-generic-expo;
		// transition-property: transform opacity;

		&.hidden {
			pointer-events: none;

			@media screen and (min-width: $mobile-width) {
				opacity: 0;
			}

			&.left {
				transform: translate(calc(-100% - 50px), 0px);
			}
			&.right {
				transform: translate(calc(100% + 50px), 0px);
			}
		}
	}
</style>
