<script lang="ts">
	let {
		canvas,
		setCurrCanvas
	}: {
		canvas: DB.Canvas;
		setCurrCanvas: (canvas: DB.Canvas) => void;
	} = $props();
	const options: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour12: true
	};

	const format = (datestr: string) => {
		return new Date(datestr)
			.toLocaleString("en-US", options)
			.replace(",", "")
			.replace(" at", " @");
	};

	const { title, locDesc, createdOn, isArchived } = $derived(canvas);
</script>

<div class="item-frame container" class:archived={isArchived}>
	<section>
		<aside>
			<div id="title">
				<p><strong>{title}</strong></p>
			</div>
			{locDesc}
		</aside>

		<p>
			Created on {format(createdOn)}
		</p>
	</section>

	<button id="edit" onclick={() => setCurrCanvas(canvas)}>
		<img src="icons/pencil.svg" alt="edit" />
	</button>
</div>

<style>
	.container {
		display: flex;
		justify-content: space-between;
		padding: 16px;
	}

	section {
		display: flex;
		flex-direction: column;
		place-self: center;
		gap: 22px;
	}

	#title {
		font-weight: 600;
	}

	#edit {
		background-color: transparent;
		place-self: center;
		padding: 25px 15px;

		@media (hover: hover) {
			&:hover {
				opacity: 0.7;
			}
		}

		&:active {
			opacity: 0.8;
		}
	}

	.archived {
		opacity: 0.5;
	}
</style>
