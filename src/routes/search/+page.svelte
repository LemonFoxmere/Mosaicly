<script lang="ts">
	let canvasCode = "";
	let canvasFound = true;

	// check if the canvas exists
	// if yes: redirect to canvas
	// else: show error message  (text has its own if statement)
	function Submit() {
		canvasFound = canvasCode.length > 0;
		if (canvasFound) window.location.href = "/canvas";
	}
</script>

<main>
	<section id="content">
		<h1>Find a canvas</h1>
		<p>
			Found a canvas that you can shit post on? Great. Go to your camera app or wherever you
			scan QR codes and scan the canvas QR code. You should be redirected back here where
			we’ll check if the canvas you scanned is real, and you can start drawing your stuff.
			<br /><br />
			Just remember, don’t walk too far away from the canvas. Because you’ll lose access, and no
			one likes losing privilege.
			<br /><br />
			In the case that the canvas QR code is broken or un-scannable, you can put in the canvas
			backup code below, and we’ll check it the same way.
		</p>
	</section>

	<div id="seperator">
		<div class="dash" />
		<div class="dot" />
		<div class="dash" />
		<div class="dot" />
		<div class="dash" />
	</div>

	<section id="cta">
		<div class="input-wrapper item-frame">
			<input placeholder="0000-0000-0000" maxlength="12" bind:value={canvasCode} />
			<button
				disabled={canvasCode.length < 12}
				onclick={() => {
					Submit();
				}}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="black"
					class="svg-button"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
			</button>
		</div>
		{#if canvasFound == false}
			<p class="error-text">No canvas found</p>
		{/if}
		<a class="wrapper" href="/">
			<button>Go back home</button>
		</a>
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
	main {
		width: 100%;
		height: fit-content;
		padding: 10px 30px 50px 30px;

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		row-gap: 20px;

		#content {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 20px;
		}

		#seperator {
			width: 100%;
			height: fit-content;

			display: flex;
			justify-content: center;
			align-items: center;
			column-gap: 10px;

			div {
				background-color: $text-tertiary;
				border-radius: 10px;
				height: 5px;

				&.dash {
					width: 24px;
				}
				&.dot {
					width: 5px;
				}
			}
		}

		.input-wrapper {
			width: 100%;
			position: relative;
			display: flex;
			justify-content: space-between;
			align-items: center;

			padding: 0px 15px 0px 20px;

			input {
				padding: 0;
				width: 100%;
				border: none;
			}

			button {
				width: 32px;
				aspect-ratio: 1/1;
				right: 0;
				background-color: transparent;
				padding: 0;
			}

			.svg-button {
				height: 80%;
			}
		}
		#cta {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 10px;
		}

		.error-text {
			color: $accent-error;
		}
	}
</style>
