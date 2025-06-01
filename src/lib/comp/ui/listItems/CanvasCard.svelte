<script lang="ts">
	interface Props {
		canvas: DB.Canvas;
		ctaOptions?: () => any;
		caption?: () => any;
	}
	let { canvas, ctaOptions, caption }: Props = $props();

	const { title, locDesc, isArchived } = $derived(canvas);
</script>

<main class="item-frame">
	<section id="content" class:archived={isArchived}>
		<section id="description">
			<section id="title-container">
				<p class="title">
					{title}
					{#if isArchived}
						(Archived)
					{/if}
				</p>
				<p class="desc-text">{locDesc}</p>
			</section>

			{@render caption?.()}
		</section>
	</section>

	<section id="cta">
		{@render ctaOptions?.()}
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 20px;

		padding: 15px 20px;

		@media screen and (min-width: $mobile-width) {
			flex-direction: row;
		}

		#content {
			max-width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			overflow: hidden;

			&.archived {
				opacity: 0.3;
			}

			#description {
				display: flex;
				max-width: 100%;
				flex-direction: column;
				row-gap: 15px;

				#title-container {
					display: flex;
					max-width: 100%;
					flex-direction: column;

					.desc-text {
						max-width: 100%;
						text-overflow: ellipsis;
						overflow: hidden;

						display: -webkit-box;
						line-clamp: 2;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
					}
				}
			}
		}

		#cta {
			display: flex;
			flex-direction: row;
			justify-content: flex-end;
			align-items: center;
			gap: 5px;

			@media screen and (min-width: $mobile-width) {
				justify-content: center;
			}
		}
	}
</style>
