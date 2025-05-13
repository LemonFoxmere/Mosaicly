<script lang="ts">
	import Modal from "./EditCanvasModal.svelte";
	let isOpen = $state(false);

	let { canvas }: { canvas: DB.Canvas } = $props();
	const options: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
		year: "numeric",
		// hour: 'numeric',
		// minute: '2-digit',
		hour12: true
	};

	const format = (datestr: string) => {
		return new Date(datestr)
			.toLocaleString("en-US", options)
			.replace(",", "")
			.replace(" at", " @");
	};

	const { title, loc_desc, created_on } = canvas;
</script>

<!-- overlays page when modal open -->
<Modal bind:open={isOpen} {canvas} />

<div class="item-frame container">
	<section>
		<aside>
			<div id="title">{title}</div>
			{loc_desc}
		</aside>
		Created on {format(created_on)}
	</section>

	<button id="edit" onclick={() => (isOpen = true)}>
		<img src="icons/pencil.svg" alt="edit" />
	</button>
</div>

<style>
	.container {
		font-family: "Outfit", system-ui, Helvetica, sans-serif;
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
</style>
