<script lang="ts">
	export let colors = ["#fff", "#000", "#4fa9cc", "#3f8d27"];

	let currentColor = colors[0];

	function ShowSelectedColor(color: string) {
		document.getElementById("SelectedColor")!.style.backgroundColor = color;
	}
</script>

<section>
    <!-- Creating color button -->
	<div>
		{#each colors as color}
			<button
				on:click={() => {
					currentColor = color;
					ShowSelectedColor(color);
				}}
				style:background={color}
			>
				<span class="visually-hidden">
					color: {color}
				</span>
			</button>
		{/each}
	</div>
	<p id="SelectedColor" class="square"></p>
</section>

<style lang="scss">
	.square {
		width: 50px;
		height: 50px;
		background-color: white;
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

	section {
		display: inline-block;
	}

	section > div {
		flex-grow: 1;
	}

	section > svg {
		flex-shrink: 0;
	}
</style>
