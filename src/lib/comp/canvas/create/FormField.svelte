<script lang="ts">
	/** Label text for the field */
	export let label: string;
	/** Whether to show a required indicator */
	export let required: boolean = false;
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
