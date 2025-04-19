<script lang="ts">
	let { colors = ["#fff", "#000"], ChangeColor } = $props();

	function ShowSelectedColor(color: string) {
		document.getElementById("SelectedColor")!.style.backgroundColor = color;
	}
</script>

<section>
	<!-- 
        Creating color button
        On click:
            change the selected color to show the button's color
            send event to canvas to change the selected color
    -->
	{#each colors as color}
		<div>
			<button
				onclick={() => {
					ShowSelectedColor(color);
					ChangeColor(color);
				}}
				style:background={color}
			>
				<span class="visually-hidden">
					color: {color}
				</span>
			</button>
		</div>
	{/each}
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

	div {
		display: inline-block;
	}
</style>
