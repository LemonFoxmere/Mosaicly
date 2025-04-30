<script lang="ts">
	type Canvas = {
		id: string;
		name: string;
		loc: string;
		createdOn: Date;
	};

	let { canvas }: { canvas: Canvas } = $props();

	const { id, name, loc, createdOn } = canvas;
</script>

<div class="item-frame container">
	<section>
		<aside>
			<div id="name">{name}</div>
			{loc}
		</aside>
		Created on {createdOn.toLocaleDateString("en-US").toString()}
	</section>

	<a id="edit" href={`/canvas/${canvas.id}`}>
		<img src="icons/pencil.svg" alt="edit" />
	</a>
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

	#name {
		font-weight: 600;
	}

	#edit {
		background-color: transparent;
		place-self: center;
		padding: 10px 15px;
	}

	#edit:hover {
		border: 1.5px solid #362121;
		border-radius: 8px;
		border-bottom-width: 4px;
	}
</style>
