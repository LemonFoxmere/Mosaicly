<script lang="ts">
	export let onNext: () => void;

	export let onBack: () => void;

	export let hideBack: boolean = false;
</script>

<div id="navigation-buttons">
	<button type="button" class="back-button" on:click={onBack} disabled={hideBack}> ← </button>

	<button type="button" class="next-button" on:click={onNext}> → </button>
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#navigation-buttons {
		position: sticky;
		bottom: 0;
		width: 100%;
		padding: 10px 0;
		background-color: $background-primary;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 40px;
	}

	.back-button,
	.next-button {
		@extend button;
		width: 50px;
		height: 50px;
		border-radius: 50%;
		border: 1.5px solid $text-primary;
		border-bottom-width: 4px;
		background-color: $background-primary;
		color: $text-primary;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		padding: 0;

		&:active {
			margin-top: 1.5px;
			height: calc(50px - 1.5px);
			border-bottom-width: 1.5px;
			transform: translateY(1.5px);
		}
	}

	/* disabled back interactions cleaner */
	.back-button:disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
