<script lang="ts">
	import Logo from '$lib/comp/ui/icons/Logo.svelte'
	let { children } = $props()
</script>

<main>
	<nav>
		<!-- <button class="solid-small">Log in</button> -->
		<div id="logo"><Logo s={28} /></div>
	</nav>

	<div id="content">
		{@render children()}
	</div>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
	  // border: 1px solid blue;
	  width: 100%;
	  display: flex;
	  flex-direction: column;
	  align-items: center;

	  nav {
	    display: flex;
	    flex-direction: row;
	    justify-content: center; // will change in the future when we have a login button
	    align-items: center;
	    padding: 10px 30px;

	    width: 100%;
	    max-width: 700px;

	    #logo {
	      color: $text-primary;
	    }
	  }

	  #content {
	    display: flex;
	    justify-content: center;
	    align-items: center;

	    width: 100%;
	    max-width: 700px;
	  }

	  @media screen and (min-width: $mobile-width) {
	    min-height: 100vh;
	    justify-content: center;
	  }
	}
</style>
