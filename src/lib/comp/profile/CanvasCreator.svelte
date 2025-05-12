<script lang="ts">
	interface CanvasInformation {
		id: string;
		name: string;
		loc: string;
		locDescription: string;
		createdOn: Date;
	}

	let { isFormOpen = false } = $props();
	let isFormComplete = $state(false);

	function CloseForm() {
		isFormOpen = false;
	}

	let nameField = "";
	let descriptionField = "";
	function CheckFormComplete() {
		// if name is longer than 1 character and description is longer than 10
		if (nameField.length > 1 && descriptionField.length >= 10) {
			return true;
		}
		return false;
	}

	function CreateCanvas() {
		let newCanvas = {
			id: 1,
			name: nameField,
			loc: "Somewhere",
			locDescription: descriptionField,
			createdOn: new Date()
		};

		// probably redirect to canvas
		window.location.href = "/canvas";

		// CloseForm();
	}
</script>

<div id="background-fade">
	<div id="creation-form">
		<form>
			<label
				>Name: <input
					bind:value={nameField}
					maxlength="30"
					oninput={() => {
						isFormComplete = CheckFormComplete();
					}}
				/></label
			>
			<label>Location: "Latitude : Longitude"</label>
			<label
				>Location description: <input
					bind:value={descriptionField}
					maxlength="100"
					oninput={() => {
						isFormComplete = CheckFormComplete();
					}}
				/>
			</label>

			<div id="button-wrapper">
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

	#background-fade {
		background-color: rgba(0, 0, 0, 0.35);
		position: fixed;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		z-index: 2;
	}

	#creation-form {
		background-color: $background-accent;
		position: absolute;
		display: flex;
		width: 80%;
		padding: 30px;
		z-index: 4;

		#button-wrapper {
			width: 100%;
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0px 7px 0px 20px;
		}
	}
</style>
