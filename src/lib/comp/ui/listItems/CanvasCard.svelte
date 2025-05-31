<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		title?: string;
		locDesc?: string;
		distance?: string;
		isArchived?: boolean;
		clickable?: boolean;
		onClick?: () => void;
		canvas?: DB.Canvas;
		ctaOptions?: Snippet;
		caption?: Snippet;
	}
	let {
		title: titleProp,
		locDesc: locDescProp,
		distance,
		isArchived: isArchivedProp,
		clickable = false,
		onClick,
		canvas,
		ctaOptions,
		caption
	}: Props = $props();

	const title = $derived(canvas?.title ?? titleProp ?? "");
	const locDesc = $derived(canvas?.locDesc ?? locDescProp ?? "");
	const isArchived = $derived(canvas?.isArchived ?? isArchivedProp ?? false);

	const WrapperElement = clickable ? "button" : "div";
</script>

<svelte:element
	this={WrapperElement}
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
				{#if distance}
					<p class="distance">{distance}</p>
				{/if}
			</section>

			{@render caption?.()}
		</section>
	</section>

	<section id="cta">
		{@render ctaOptions?.()}
	</section>
</svelte:element>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.canvas-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		background-color: $background-primary;

		padding: 15px 20px;

		&.clickable {
			cursor: pointer;
			text-align: left;
			padding: 14px 25px 14px 20px;
			min-height: 120px;

			transition: 300ms $out-generic-expo;
			transition-property: opacity, transform, border-color;

			@media (hover: hover) {
				&:hover {
					opacity: 0.8;
				}
			}

			&:active {
				opacity: 1;
				transform: scale(0.98);
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
				row-gap: 5px;

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

					.distance {
						font-size: 14px;
						font-weight: 500;
						color: $text-tertiary;
					}
				}
			}
		}

		#cta {
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			gap: 5px;
		}
	}
</style>
