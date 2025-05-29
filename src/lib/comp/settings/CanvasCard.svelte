<script lang="ts">
	import Pencil from "../ui/icons/Pencil.svelte";

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
			<Pencil s={28} />
		</button>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		padding: 14px 20px;

		#content {
			width: 100%;
			max-width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			column-gap: 20px;

			&.archived {
				opacity: 0.3;
			}

			#description {
				display: flex;
				max-width: calc(100% - 70px);
				flex-direction: column;
				row-gap: 15px;

				#title-container {
					display: flex;
					max-width: 100%;
					flex-direction: column;

					.desc-text {
						max-width: 100%;
						display: -webkit-box;
						line-clamp: 2;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						overflow: hidden;
					}
				}
			}

			#edit-canvas {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 32px;
				height: 32px;
				cursor: pointer;
			}
		}
	}
</style>
