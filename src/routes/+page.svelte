<script lang="ts">
</script>

<main>
	<section id="content">
		<section id="titles">
			<h1 id="main">Touching Grass</h1>
			<h1 id="sub">At its finest.</h1>
		</section>

		<section id="cta">
			<a class="wrapper" href="/search">
				<button id="search">Start touching grass</button>
			</a>
			<a class="wrapper" href="/about">
				<button class="outline" id="about">What even is this</button>
			</a>
		</section>

		<p>
			Click to go to canvas:
			<a href="/canvas">Canvas AWAY!!</a>
		</p>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: 100%;
		padding: 30px;
		display: flex;
		justify-content: center;
		align-items: center;

		// account for navbar to be truly centered
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
</style>
