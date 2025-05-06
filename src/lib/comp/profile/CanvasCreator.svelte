<script lang="ts">
	interface CanvasInformation {
		id: string;
		name: string;
		loc: string;
		locDescription: string;
		createdOn: Date;
	}

	let isFormComplete = false; // if name is longer than 1 character and description is longer than 10
	let { isOpen } = $props();

	function CloseForm() {
		isOpen = false;
	}

	function CreateCanvas() {
		CloseForm();
	}
</script>

<div class="background">
	<div class="creation-form">
		<form>
			<label for="name">Name: <input type="text" /></label>
			<label>Location: "blah blah blah"</label>
			<label for="name">Location description: <input type="text" /> </label>

			<div>
				<button
					onclick={() => {
						CloseForm();
					}}>Close</button
				>
				<button disabled={!isFormComplete} onclick={CreateCanvas}>Create</button>
			</div>
		</form>
	</div>
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.background {
		background-color: rgba(0, 0, 0, 0.35);
		position: fixed;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		z-index: 2;
	}

	.creation-form {
		background-color: $background-accent;
		position: relative;
		display: flex;
		padding: 30px;
		z-index: 4;
	}
</style>
