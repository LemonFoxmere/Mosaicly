<script lang="ts">
	let { data } = $props()
</script>

Welcome to the Big Canvas page.

<ul>
	{#each data.canvases as canvas}
		<li>location description: {canvas.loc_desc}</li>
	{/each}
</ul>
