<script lang="ts">
	interface Props {
		label: string;
		invalid?: boolean;
		required?: boolean;
		stretch?: boolean;
		labelAction?: () => any;
		children?: () => any;
		showDebugOutline?: boolean;
	}
	let {
		label,
		invalid = $bindable(false),
		required = false,
		stretch = false,
		labelAction,
		children,
		showDebugOutline = false
	}: Props = $props();
</script>

<main class:invalid class:stretch class:showDebugOutline>
	<p class="caption">
		{label}{required ? "*" : ""}

		<!-- For any extra fields after the label -->
		{@render labelAction?.()}
	</p>
	{@render children?.()}
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 5px;

		// for all children
		transition: 150ms $out-generic;
		transition-property: color, border-color, opacity;

		&.showDebugOutline {
			border: 1px solid blue;
		}

		&.stretch {
			flex-grow: 1;
		}

		&.invalid {
			* {
				color: $accent-error;
			}
			input::placeholder {
				color: $accent-error;
			}
		}
	}
</style>
