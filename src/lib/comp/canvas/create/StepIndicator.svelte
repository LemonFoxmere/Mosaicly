<script lang="ts">
	export let currentStep: number;
	const totalSteps = 3;
</script>

<div class="step-indicator-wrapper">
	<div class="step-indicator">
		{#each Array(totalSteps) as _, i}
			<div class="step">
				<div class="dot" class:active={i + 1 === currentStep} />
				{#if i < totalSteps - 1}
					<div class="line" class:active={i + 1 < currentStep} />
				{/if}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.step-indicator-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px 0;
		width: 100%; // Ensure it can be centered if parent is wider
	}

	.step-indicator {
		display: flex;
		align-items: center;
	}

	.step {
		display: flex;
		align-items: center;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid $text-primary;
		background-color: $background-primary; // empty circle ()
		transition:
			background-color 0.3s ease,
			border-color 0.3s ease;

		&.active {
			background-color: $text-primary; // filled circle ;)
			border-color: $text-primary;
		}
	}

	.line {
		height: 2px;
		width: 30px;
		background-color: $text-primary;
	}
</style>
