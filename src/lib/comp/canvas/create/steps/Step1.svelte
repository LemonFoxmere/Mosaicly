<script lang="ts">
	import FormField from "$lib/comp/ui/general/FormField.svelte";

	interface Props {
		canvasName: string;
		locationDescription: string;
	}
	let { canvasName = $bindable(), locationDescription = $bindable() }: Props = $props();
</script>

<main>
	<section id="greeting-card">
		<h2>Ready for shitposting?</h2>
		<p>Create a new canvas.</p>
	</section>

	<form id="main-form">
		<div id="canvas-name" class="form-item">
			<FormField label="Canvas Name">
				<input type="text" bind:value={canvasName} placeholder="Frog" />
			</FormField>
		</div>

		<div id="location-description" class="form-item">
			<FormField label="Location Description" stretch={true}>
				{#snippet labelAction()}
					<button id="what-is-this" class="none">
						<span aria-label="What is this?">(What is this?)</span>
					</button>
				{/snippet}

				<textarea
					bind:value={locationDescription}
					placeholder="On the pole near the entrance of the Cowell dining hall."
				></textarea>
			</FormField>
		</div>
	</form>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
	@use "$static/stylesheets/fonts";

	main {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 15px;

		#greeting-card {
			display: flex;
			flex-direction: column;
			row-gap: 5px;
		}

		#main-form {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 15px;

			.form-item {
				&#location-description {
					height: 100%;

					textarea {
						height: 100%;
						resize: none;
					}
				}
			}
		}
	}
</style>
