<script lang="ts">
	import { enhance } from "$app/forms";
	import { injectGeography } from "../canvas/utils/Geolocation";

	let title = $state("");
	let loc_desc = $state("");

	let formOpened = $state(false);

	const closeForm = () => {
		formOpened = false;
	};

	const openForm = () => {
		formOpened = true;
	};
</script>

<button onclick={openForm}>+ Canvas</button>

<main>
	<div
		id="form-overlay"
		class={{ disabled: !formOpened }}
		ontouchmove={(e) => {
			e.preventDefault();
			e.stopPropagation();
		}}
		onclick={closeForm}
	>
		<div id="form-container" onclick={(e) => e.stopPropagation()}>
			<form action="/api/canvas?/createCanvas" method="post" use:enhance={injectGeography}>
				<label>
					<p>Title:</p>
					<input name="title" type="text" bind:value={title} autocomplete="off" min={1} />
				</label>

				<label>
					<p>Describe Location:</p>
					<input
						name="loc_desc"
						type="text"
						bind:value={loc_desc}
						autocomplete="off"
						min={1}
					/>
				</label>

				<button>Create Canvas</button>
			</form>
		</div>
	</div>
</main>

<style lang="scss">
	#form-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: all;
		transition: opacity 300ms ease;

		&.disabled {
			opacity: 0;
			pointer-events: none;
		}
	}

	#form-container {
		background: #fff;
		padding: 2rem;
		border-radius: 0.75rem;
		width: 90%;
		max-width: 480px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

		form {
			display: flex;
			flex-direction: column;
			gap: 1.5rem;

			/* full-width form groups */
			label {
				width: 100%;
				display: flex;
				flex-direction: column;
				gap: 0.5rem;

				p {
					/* label text on its own line */
					margin: 0;
					font-weight: 600;
					color: #333;
				}

				input {
					width: 100%;
					box-sizing: border-box;
					padding: 0.5rem;
					border: 1px solid #ccc;
					border-radius: 0.375rem;

					&:focus {
						outline: none;
						border-color: #6b46c1;
						box-shadow: 0 0 0 2px rgba(107, 70, 193, 0.2);
					}
				}
			}
		}
	}
</style>
