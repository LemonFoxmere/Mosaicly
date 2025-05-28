<script lang="ts">
	interface Props {
		val: string;
		placeholder?: string;
		maxLen?: number;
		rows?: number; // how many rows should be showed?
		showRemaining?: boolean;
		invalid?: boolean;
		name?: string; // for forms
	}
	let {
		val = $bindable<string>(""),
		placeholder = "",
		maxLen = -1,
		rows = -1,
		showRemaining = false,
		invalid = $bindable<boolean>(false),
		name = ""
	}: Props = $props();
</script>

<main class:invalid>
	<textarea
		{name}
		{placeholder}
		rows={Math.max(rows, 0)}
		autocomplete="off"
		class:invalid
		bind:value={val}
	/>
	{#if maxLen > 0 && showRemaining}
		<p id="character-ct">{maxLen - val.length}</p>
	{/if}
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;

		textarea {
			width: 100%;
			height: 100%;
			display: flex;
		}

		#character-ct {
			position: absolute;
			text-align: right;
			right: 1.5px;
			bottom: 4px;
			padding: 7px 15px;

			background-color: $background-primary;
			border-bottom-right-radius: 8px;
			border-top-left-radius: 8px;
		}

		&.invalid {
			color: $accent-error;
			#character-ct {
				color: inherit;
			}
		}
	}
</style>
