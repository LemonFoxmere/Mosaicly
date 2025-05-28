<script lang="ts">
	let {
		canvas,
		onEdit: setCurrCanvas
	}: {
		canvas: DB.Canvas;
		onEdit: (canvas: DB.Canvas) => void;
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
				<p class="title">{title}</p>
				<p class="desc-text">{locDesc}</p>
			</section>

			<p>
				Created on {formatDate(createdOn)}{isArchived ? " (Archieved)" : ""}
			</p>
		</section>

		<button id="edit-canvas" class="none" onclick={() => setCurrCanvas(canvas)}>
			<img src="icons/pencil.svg" alt="edit" />
		</button>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		padding: 14px 20px;

		#content {
			width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			column-gap: 20px;

			&.archived {
				opacity: 0.3;
			}

			#description {
				display: flex;
				flex-direction: column;
				row-gap: 15px;

				#title-container {
					display: flex;
					flex-direction: column;

					.desc-text {
						display: -webkit-box;
						line-clamp: 2;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						overflow: hidden;
					}
				}
			}

			#edit-canvas {
				padding: 5px;
				cursor: pointer;
			}
		}
	}
</style>
