<script lang="ts">
	import Butterfly from "$lib/comp/ui/graphics/Butterfly.svelte";
</script>

<main>
	<section id="content">
		<h1>What is this?</h1>

		<p>
			Mosaicly is a location-based pixel art game for UCSC students who desperately need to
			touch grass while not being able to do so without some sort of dopamine hit every 5
			seconds.
			<br /><br />
			Imagine if Pokémon Go and r/place had an affair and our lawyers got custody. Instead of catching
			fake animals or sending threats to XQC, you drop pixel canvases across campus and force people
			to actually walk to them if they want to add anything.
			<br /><br />
			Wanna make one? Put a canvas on a lamppost, bathroom stall, or wherever needs to be legally
			vandalized. You'll get a QR code. People scan it, see your masterpiece, and if they're brave
			enough, they can contribute — but only in person. No remote edits. Just you, your legs, and
			your questionable art skills.
			<br /><br />
			Oh and you also earn points and level up or something. HR told me dopamine hits are good
			for revenue.
		</p>
	</section>

	<div id="seperator">
		<div class="dash" />
		<div class="dot" />
		<div class="dash" />
		<div class="dot" />
		<div class="dash" />
	</div>

	<section id="cta">
		<a class="wrapper" href="/nearby">
			<button id="search">Start touching grass</button>
		</a>
		<a class="wrapper" href="/">
			<button class="outline" id="about">Go back home</button>
		</a>
	</section>

	<section id="graphics">
		<!-- butterfly -->
		<div class="butterfly only-desktop"><Butterfly s={300} /></div>
		<div class="butterfly only-mobile"><Butterfly s={250} /></div>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		position: relative;

		width: 100%;
		height: fit-content;
		margin: auto 0;
		padding: 10px 30px;
		display: flex;

		// account for navbar height
		padding-bottom: $navbar-height;

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		row-gap: 30px;

		* {
			z-index: 2;
		}

		#content {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 20px;
		}

		#seperator {
			width: 100%;
			height: fit-content;

			display: flex;
			justify-content: center;
			align-items: center;
			column-gap: 10px;

			div {
				background-color: $text-tertiary;
				border-radius: 10px;
				height: 5px;

				&.dash {
					width: 24px;
				}
				&.dot {
					width: 5px;
				}
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

		#graphics {
			position: absolute;
			top: 0;
			left: 0;
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

			.butterfly {
				bottom: 0;
				right: 0;
				transform: translate(40px, 0px); // offset to cutoff a bit

				&.only-desktop {
					transform: translate(10vw, -10px);
				}
			}
		}
	}
</style>
