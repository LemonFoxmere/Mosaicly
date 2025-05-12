<script lang="ts">
	interface Props {
		label: string;
		required?: boolean;
		stretch?: boolean;
	}
	let { label, required = false, stretch = false }: Props = $props();
</script>

<label class:stretch>
	<p class="caption">
		{label}{required ? "*" : ""}
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
	}

	label.stretch {
		flex: 1 1 auto;
		min-height: 0;
	}

	.caption {
		color: $text-tertiary;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
		display: flex;
		align-items: center;
		gap: 5px;
	}
</style>
