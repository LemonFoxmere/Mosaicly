<script lang="ts">
	let {
		canvas,
		ctaOptions
	}: {
		canvas: DB.Canvas;
		ctaOptions: () => any;
	} = $props();

	const dateOptions: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour12: true
	};
	const formatDate = (date: string | Date) => {
		const d = typeof date === "string" ? new Date(date) : date;
		return d.toLocaleString("en-US", dateOptions).replace(" at", " @");
	};

	const { title, locDesc, createdOn, isArchived } = $derived(canvas);
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

			<p>
				Created on <span>{formatDate(createdOn)}</span>
			</p>
		</section>
	</section>

	<section id="cta">
		{@render ctaOptions()}
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		display: flex;
		justify-content: space-between;
		column-gap: 20px;

		padding: 15px 20px;

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

			span {
				white-space: nowrap; // do not wrap things like date
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
