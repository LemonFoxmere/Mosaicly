<script lang="ts">
	interface Props {
		label: string;
		required?: boolean;
	}
	let { label, required = false }: Props = $props();
</script>

<label>
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
