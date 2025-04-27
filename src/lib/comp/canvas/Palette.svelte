<!--
	Palette
	Gives user color selection
	Shows current color selection using a square div
-->

<script lang="ts">
	let { colors = [], ChangeColor } = $props();

	if (!colors || colors.length < 20) {
		colors = [
			"#000000",
			"#808080",
			"#C0C0C0",
			"#FFFFFF",
			"#FF0000",
			"#FFFF00",
			"#00FF00",
			"#00FFFF",
			"#0000FF",
			"#FF00FF",
			"#800000",
			"#FFA500",
			"#808000",
			"#008000",
			"#008080",
			"#000080",
			"#800080",
			"#FFC0CB",
			"#A52A2A",
			"#D2B48C"
		];
	}

	let selectedColorIndex = $state(0);

	function selectColor(color: string, index: number) {
		selectedColorIndex = index;
		ChangeColor(color);
	}

	function isCornerPosition(index: number, totalColors: number) {
		const rowSize = totalColors / 2;
		return (
			index === 0 || index === rowSize - 1 || index === rowSize || index === totalColors - 1
		);
	}
</script>

<div class="palette">
	{#each colors as color, index}
		<button
			class:selected={selectedColorIndex === index}
			class:top-left={index === 0}
			class:top-right={index === 9}
			class:bottom-left={index === 10}
			class:bottom-right={index === 19}
			style:background={color}
			on:click={() => selectColor(color, index)}
			on:keydown={(e) => e.key === "Enter" && selectColor(color, index)}
		>
			<span class="visually-hidden">color: {color}</span>
		</button>
	{/each}
</div>

<style lang="scss">
	.palette {
		display: grid;
		grid-template-columns: repeat(10, 40px);
		grid-template-rows: repeat(2, 40px);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
		width: fit-content;
	}

	button {
		width: 40px;
		height: 40px;
		border: none;
		margin: 0;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		border-radius: 0;

		&.selected::after {
			content: "";
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 3px;
			background-color: black;
		}

		&.top-left {
			border-top-left-radius: 8px;
		}

		&.top-right {
			border-top-right-radius: 8px;
		}

		&.bottom-left {
			border-bottom-left-radius: 8px;
		}

		&.bottom-right {
			border-bottom-right-radius: 8px;
		}
	}

	.visually-hidden:not(:focus):not(:active) {
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		height: 1px;
		width: 1px;
		overflow: hidden;
		position: absolute;
		white-space: nowrap;
	}
</style>
