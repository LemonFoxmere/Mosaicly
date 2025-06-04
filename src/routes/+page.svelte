<script lang="ts">
	import Blocks from "$lib/comp/ui/graphics/Blocks.svelte";
	import Cobweb from "$lib/comp/ui/graphics/Cobweb.svelte";
	import Grass from "$lib/comp/ui/graphics/Grass.svelte";
	import Map from "$lib/comp/ui/graphics/Map.svelte";
</script>

<main>
	<section id="content">
		<section id="titles">
			<h1 id="main">Touching Grass,</h1>
			<h1 id="sub">At its finest.</h1>
		</section>

		<section id="cta">
			<a class="wrapper" href="/nearby">
				<button id="search">Start touching grass</button>
			</a>
			<a class="wrapper" href="/about">
				<button class="outline" id="about">What even is this</button>
			</a>
		</section>
	</section>
</main>

<section id="graphics">
	<!-- The block on top -->
	<div class="blocks only-desktop"><Blocks s={300} /></div>
	<div class="blocks only-mobile"><Blocks s={250} /></div>

	<!-- Grass on the bottom left -->
	<div class="grass only-desktop"><Grass s={300} /></div>
	<div class="grass only-mobile"><Grass s={230} /></div>

	<!-- Cobweb on the bottom right -->
	<div class="cobweb only-desktop"><Cobweb s={150} /></div>
	<div class="cobweb only-mobile"><Cobweb s={100} /></div>

	<!-- Map on the right (desktop only) -->
	<div class="map only-desktop"><Map s={250} /></div>
</section>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: fit-content;
		margin: auto 0;
		padding: 30px;
		display: flex;

		z-index: 2;

		// account for navbar height
		padding-bottom: $navbar-height;

		#content {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 30px;

			#titles {
				#sub {
					font-weight: 400;
				}
			}

			#cta {
				width: 100%;
				display: flex;
				flex-direction: column;
				row-gap: 10px;

				a {
					width: 100%;
					button {
						width: 100%;
					}
				}
			}
		}
	}

	#graphics {
		position: absolute;
		width: 100%;
		// max-width: $global-max-width;
		height: calc(100% - $navbar-height);

		display: flex;
		justify-content: center;
		align-items: center;

		z-index: 1; // stay below the main content

		* {
			position: absolute;
			color: $text-tertiary;
		}

		.blocks {
			top: 0;
			left: 0;
			transform: translate(-30px, -45px); // offset to cutoff a bit

			&.only-desktop {
				transform: translate(10vw, -10px);
			}
		}

		.grass {
			bottom: 0;
			left: 0;
		}

		.cobweb {
			bottom: 0;
			right: 0;
		}

		.map {
			top: 20vh;
			right: 15vw;
			transform: rotate(13deg);
		}
	}
</style>
