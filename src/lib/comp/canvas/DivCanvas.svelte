<script lang="ts">
	let width = 25,
		height = 25;

	let color = $state("#0000000");
	function ChangeBackgroundColor() {}
</script>

<section>
	<table>
		{#each { length: width } as _}
			<td>
				{#each { length: height } as _}
					<div class="pixel" onclick={ChangeBackgroundColor}></div>
				{/each}
			</td>
		{/each}
	</table>
</section>

<style lang="scss">
	.pixel {
		width: 15px;
		height: 15px;
		background-color: white;
		cursor: pointer;
	}

	td {
		margin: 0;
		padding: 0;
	}

	table {
		margin: 0;
		padding: 0;
		border-collapse: collapse;
	}
</style>
