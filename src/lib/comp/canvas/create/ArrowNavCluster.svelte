<script lang="ts">
	import LeftArrowOutline from "$lib/comp/ui/icons/LeftArrowOutline.svelte";
	import RightArrowOutline from "$lib/comp/ui/icons/RightArrowOutline.svelte";

	interface Props {
		onNext: () => void;
		onBack: () => void;
		leftDisabled?: boolean;
		rightDisabled?: boolean;
	}
	let {
		onNext,
		onBack,
		leftDisabled = $bindable(true),
		rightDisabled = $bindable(false)
	}: Props = $props();
</script>

<main>
	<button class="nav-button none" disabled={leftDisabled} on:click={onBack}>
		<LeftArrowOutline s={42} />
	</button>
	<button class="nav-button none" disabled={rightDisabled} on:click={onNext}>
		<RightArrowOutline s={42} />
	</button>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		column-gap: 50px;

		.nav-button {
			width: fit-content;
			height: fit-content;

			display: flex;
			align-items: center;
			justify-content: center;

			border-radius: 50px;
			cursor: pointer;

			color: $text-primary;

			@media (hover: hover) {
				&:hover {
					opacity: 0.7;
				}
			}

			&:active {
				opacity: 0.8;
			}
		}
	}
</style>
