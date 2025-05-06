<script lang="ts">
	import RightArrowOutline from "$lib/comp/ui/icons/RightArrowOutline.svelte";

	const codeFormat = /^(((\w{4})-){2}(\w{4}))$/; // format: xxxx-xxxx-xxxx
	let canvasCode = "";
	let canvasFound = true;
	let idField: HTMLElement;

	// animate the error shake for a certain text box
	const animateFailure = (ele: HTMLElement) => {
		ele.classList.remove("no-anim");
		ele.onanimationend = () => {
			ele.classList.add("no-anim");
			ele.onanimationend = null;
		};
	};

	/*
	 * check if the canvas exists
	 * if yes: redirect to canvas
	 * else: show error message  (text has its own if statement)
	 */

	const dummyCode = "aaaaaaaaaaaa";
	function submit() {
		// always true
		canvasFound = canvasCode === dummyCode;

		if (!canvasFound) {
			animateFailure(idField);
		} else {
			window.location.href = "/canvas";
		}
	}
</script>

<main>
	<section id="content">
		<h1>Find a canvas</h1>
		<p>
			Found a canvas that you can shit post on? Great. Go to your camera app or wherever you
			scan QR codes and scan the canvas QR code. You should be redirected back here where
			we'll check if the canvas you scanned is real, and you can start drawing your stuff.
			<br /><br />
			Just remember, don't walk too far away from the canvas. Because you'll lose access, and no
			one likes losing privilege.
			<br /><br />
			In the case that the canvas QR code is broken or un-scannable, you can put in the canvas
			backup code below, and we'll check it the same way.
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
		<form bind:this={idField} id="input-wrapper" class="item-frame no-anim">
			<input bind:value={canvasCode} placeholder="a9Xk-72Bc-dF4m" maxlength="14" />
			<!-- must be in the format of xxxx-xxxx-xxxx -->
			<button type="submit" disabled={!codeFormat.test(canvasCode)} on:click={submit}>
				<RightArrowOutline s={32} />
			</button>
		</form>

		<section id="err" class={`${canvasFound ? "hidden" : "shown"}`}>
			<p>No canvas found. Try another one.</p>
		</section>
		<!-- <a class="wrapper" href="/">
			<button>Go back home</button>
		</a> -->
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		width: 100%;
		height: fit-content;
		margin: auto 0;
		padding: 10px 30px;

		// account for navbar height
		padding-bottom: $navbar-height;

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		row-gap: 30px;

		@media screen and (min-width: $mobile-width) {
			height: calc(100% - $navbar-height);
			justify-content: center;
		}

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
			justify-content: flex-start;
			align-items: center;
			column-gap: 10px;

			div {
				background-color: $text-tertiary;
				height: 5px;
				&.dash {
					width: 24px;
				}
				&.dot {
					width: 5px;
				}
			}
		}

		#cta {
			width: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 10px;

			color: $text-primary;

			#input-wrapper {
				width: 100%;
				position: relative;
				display: flex;
				justify-content: space-between;
				align-items: center;
				border-color: $accent-error;
				color: $accent-error;

				padding: 0px 7px 0px 20px;

				animation: 400ms 1 shake;
				&.no-anim {
					// the normal state of the input fields
					animation: none;

					border-color: $text-primary;
					color: $text-primary;
					transition: 500ms $in-cubic;
					transition-property: border-color color opacity;
				}

				input {
					padding: 0;
					width: 100%;
					border: none;
					color: inherit;
				}

				button {
					width: fit-content;
					aspect-ratio: 1/1;
					background-color: transparent;
					padding: 0;
					color: inherit;
				}
			}
		}

		#err {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;

			&.hidden {
				opacity: 0;
				pointer-events: none;
			}

			p {
				color: $accent-error;
			}
		}

		// animation definitions
		@keyframes shake {
			0% {
				transform: translateX(0px);
			}
			20% {
				transform: translateX(10px);
			}
			40% {
				transform: translateX(-10px);
			}
			60% {
				transform: translateX(5px);
			}
			80% {
				transform: translateX(-5px);
			}
			100% {
				transform: translateX(0px);
			}
		}
	}
</style>
