<script lang="ts">
	// import '../app.css'
	let { children } = $props()
</script>

<div>
	<a href="/">Home</a>
	<a href="/big_canvas">Total Canvas</a>
</div>

{@render children()}
