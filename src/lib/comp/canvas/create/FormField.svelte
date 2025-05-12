<script lang="ts">
	export let label: string;
	export let required: boolean = false;
</script>

<label>
	<p class="caption">
		{label}
		<slot name="label_append" />
	</p>
	<slot />
</label>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	label {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;

		:global(input[type="text"]),
		:global(textarea) {
			width: 100%;
			background-color: $background-primary;
			border: 1.5px solid $text-primary;
			border-radius: 8px;
			padding: 12px 16px;
			font-size: 16px;
			line-height: 1.4;
			color: $text-secondary;
			box-sizing: border-box;

			&::placeholder {
				color: $text-tertiary;
			}

			&:focus::placeholder {
				color: transparent;
			}

			&:active::placeholder {
				color: transparent;
			}
		}

		:global(input[type="text"]) {
			height: 50px;
		}

		:global(textarea) {
			resize: none !important;
			min-height: 120px;
			padding: 15px 20px;
		}
	}

	.caption {
		color: $text-tertiary;
		font-size: 14px;
		font-weight: 500;
		line-height: auto;
		display: flex;
		align-items: center;
		gap: 5px;

		:global(.what-is-this) {
			text-decoration: underline;
			color: inherit;
			font-size: inherit;
			font-weight: inherit;
			cursor: help;
		}
	}
</style>
