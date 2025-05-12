<script lang="ts">
	export let currentStep: number;
	export let totalSteps: number = 3;
</script>

<div class="step-indicator" aria-label="Progress">
	{#each Array(totalSteps) as _, idx}
		<span class="dot" class:active={idx + 1 === currentStep} />
		{#if idx + 1 < totalSteps}
			<span class="line" class:active={idx + 1 < currentStep} />
		{/if}
	{/each}
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.step-indicator {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 10px 0;
		margin: 0;
	}

	.dot {
		flex: none;
		width: 12px;
		height: 12px;
		border: 2px solid $text-primary;
		border-radius: 50%;
		background-color: $background-primary;
		transition:
			background-color 0.3s $out-generic-expo,
			border-color 0.3s $out-generic-expo;
	}

	.dot.active {
		background-color: $text-primary;
		border-color: $text-primary;
	}

	.line {
		flex: 1;
		height: 2px;
		background-color: $text-primary;
		opacity: 0.3;
		transition: opacity 0.3s $out-generic-expo;
	}

	.line.active {
		opacity: 1;
	}
</style>
