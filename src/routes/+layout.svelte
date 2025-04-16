<script lang="ts">
	// import '../app.css'
	let { children } = $props()
</script>

<nav>
	<a href="/">Home</a>
	<a href="/big_canvas">Total Canvas</a>
	<a href="/app">app</a>
	<button class="solid-small">Log in</button>
</nav>

<div class="container">
	{@render children()}
</div>

<style lang="scss">
	nav {
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  gap: 1rem;
	  padding: 0.5rem;
	}

	.container {
	  padding: 0.5rem 2rem;
	}
</style>
