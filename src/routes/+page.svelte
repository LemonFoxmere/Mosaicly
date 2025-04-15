<script lang="ts">
	let x = $state(5);
	let y = $derived(2 * x);
	let z = $state(1);

	$effect(() => {
		z = x;
	});

	const testingFunc = () => {
		x += 1;
	};
</script>

<main>
	<h1>{x}</h1>
	<h2>{y}</h2>
	<button onclick={testingFunc}>Add</button>

	{#each new Array(z) as _}
		<p>Test</p>
	{/each}
</main>

<style lang="scss">
</style>
