<script lang="ts">
</script>

<main>
	<section id="testing-box" class="item-frame">
		<h1>This is a heading text.</h1>
		<h2>This is a subheading</h2>

		<p>
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem consectetur
			error, maxime minima accusamus amet ex voluptas, similique reprehenderit architecto
			neque. Voluptates expedita dolores quibusdam cupiditate dolore exercitationem totam
			quam. Aliquid asperiores quod culpa qui, itaque sint mollitia amet perferendis eveniet
			quis maxime nihil iste, omnis assumenda architecto consectetur ea, est facere odit! Qui
			assumenda odio harum eum hic excepturi!
		</p>

		<p class="caption">This is a caption. It's quite small</p>

		<section id="btn-cluster">
			<button>Solid Button</button>
			<button class="solid-small">Solid Small</button>
			<button class="outline">Outline Button</button>
			<button class="outline-small">Outline Small</button>
		</section>

		<p> Click to go to login:
			<a href="/login">Big Ol Login Button</a>
		</p>

		<p> Click to go to canvas:
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
		align-items: flex-start;

		#testing-box {
			width: min(100%, 1000px);
			padding: 40px;

			display: flex;
			flex-direction: column;
			row-gap: 20px;

			#btn-cluster {
				display: flex;
				justify-content: center;
				align-items: center;
				flex-wrap: wrap;
				gap: 10px;
			}
		}
	}
</style>
