<script lang="ts">
	interface Props {
		canvas: DB.Canvas;
		clickable?: boolean;
		onClick?: () => void;
		ctaOptions?: () => any;
		caption?: () => any;
	}
	let { canvas, clickable = false, onClick, ctaOptions, caption }: Props = $props();

	const { title, locDesc, isArchived } = $derived(canvas);
</script>

<div
	class="item-frame canvas-card"
	class:clickable
	class:archived={isArchived}
	onclick={clickable ? onClick : undefined}
>
	<section id="content">
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
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.canvas-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 20px;
		background-color: $background-primary;

		padding: 15px 20px;

		@media screen and (min-width: $mobile-width) {
			flex-direction: row;
		}

		&.clickable {
			cursor: pointer;
			text-align: left;

			transition: 300ms $out-generic-expo;
			transition-property: opacity, transform, border-color;

			@media (hover: hover) {
				&:hover {
					opacity: 0.8;
				}
			}

			&:active {
				opacity: 1;
				transform: scale(0.925);
			}

			#content {
				flex-grow: 1;
				min-width: 0;
			}

			#cta {
				flex-shrink: 0;
			}
		}

		&.archived {
			opacity: 0.3;
		}

		#content {
			max-width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			overflow: hidden;

			#description {
				display: flex;
				max-width: 100%;
				flex-direction: column;
				row-gap: 1rem; // 1 line height

				#title-container {
					display: flex;
					max-width: 100%;
					flex-direction: column;
					gap: 5px;

					.title {
						font-weight: 700;
						font-size: 16px;
						line-height: 20px;
						color: $text-primary;
					}

					.desc-text {
						max-width: 100%;
						text-overflow: ellipsis;
						overflow: hidden;
						font-size: 14px;
						line-height: 18px;
						color: $text-secondary;

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
