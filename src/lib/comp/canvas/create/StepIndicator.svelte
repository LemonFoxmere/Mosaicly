<script lang="ts">
	interface Props {
		currentStep: number;
		totalSteps?: number;
	}
	let { currentStep, totalSteps = 3 }: Props = $props();
</script>

<main aria-label="Progress">
	{#each Array(totalSteps) as _, idx}
		<span class="dot" class:active={idx + 1 <= currentStep} />
		{#if idx + 1 < totalSteps}
			<span class="line" class:active={idx + 1 < currentStep} />
		{/if}
	{/each}
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		display: flex;
		align-items: center;

		.dot {
			width: 12px;
			height: 12px;
			border-radius: 12px;
			border: 2px solid $text-primary;

			transition: 300ms $out-generic-expo;
			transition-property: background-color, border-color;

			&.active {
				background-color: $text-primary;
				border-color: $text-primary;
			}
		}

		.line {
			width: 15px;
			height: 2px;
			background-color: $text-primary;
			transition: opacity 0.3s $out-generic-expo;
		}
	}
</style>
