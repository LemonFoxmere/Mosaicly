<!--
	Palette
	Gives user color selection
	Shows current color selection using a square div
-->

<script lang="ts">
	let { colors = ["#ffffff", "#000000"], ChangeColor } = $props(); // export stuff

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
	<div>
		<p id="SelectedColor" class="square" style="margin-left: 20px;"></p>
	</div>
</section>

<style lang="scss">
	.square {
		width: 50px;
		height: 50px;
		background-color: white;
	}

	.color-button {
		width: 40px;
		height: 40px;
		cursor: pointer;
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
