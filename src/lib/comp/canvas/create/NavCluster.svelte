<script lang="ts">
	export let onNext: () => void;
	export let onBack: () => void;
	export let hideBack: boolean;
</script>

<div class="navigation-buttons">
	<button
		type="button"
		class="back-button"
		on:click={!hideBack ? onBack : undefined}
		class:disabled={hideBack}
	>
		←
	</button>
	<button type="button" class="next-button" on:click={onNext}> → </button>
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.navigation-buttons {
		position: sticky;
		background-color: $background-primary;
		padding: 10px 0px;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		gap: 40px;
		height: 70px; /* fixed height */

		.next-button,
		.back-button {
			/* Use the base button styles */
			@extend button;
			background-color: $background-primary;
			color: $text-primary;
			border: 1.5px solid $text-primary;
			border-radius: 100px;
			border-bottom-width: 4px;

			/* circle lol */
			width: 50px;
			height: 50px;
			min-width: 50px;
			min-height: 50px;

			/* center content */
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0;
			font-size: 24px;

			/* keeping original animation behavior */
			&:active {
				margin-top: 1.5px;
				height: calc(50px - 1.5px);
				border-bottom-width: 1.5px;
				transform: translateY(1.5px);
			}
		}

		.back-button.disabled {
			opacity: 0.4;
			cursor: not-allowed;

			&:active {
				margin-top: 0;
				height: 50px;
				border-bottom-width: 4px;
				transform: none;
			}
		}
	}
</style>
