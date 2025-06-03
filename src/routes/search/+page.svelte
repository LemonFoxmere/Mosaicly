<script lang="ts">
	import { enhance } from "$app/forms";
	import RightArrowOutline from "$lib/comp/ui/icons/RightArrowOutline.svelte";
	import { CircleCheck, LoaderCircle } from "@lucide/svelte";
	import type { ActionResult } from "@sveltejs/kit";
	import { onMount } from "svelte";

	const codeFormat = /^(((\w{4})-){2}(\w{4}))$/; // format: xxxx-xxxx-xxxx

	// animate the error shake for a certain text box
	const animateFailure = (ele: HTMLElement) => {
		ele.classList.remove("no-anim");
		ele.onanimationend = () => {
			ele.classList.add("no-anim");
			ele.onanimationend = null;
		};
	};

	// any error messages that pops up
	let statusMsg = $state({
		flag: false,
		err: false,
		message: ""
	});
	const showStatus = (message: string, err: boolean) => {
		console.error(message);
		statusMsg.flag = true;
		statusMsg.err = err;
		statusMsg.message = message;
	};

	// UI states
	let isFinding = $state<boolean>(false);
	let isFound = $state<boolean>(false);
	let canvasCode = $state<string>("");

	// HTML bindings
	let inputField: HTMLElement;
	let formSubmitButton: HTMLButtonElement;

	const submit = () => {
		isFinding = true; // set UI state
		formSubmitButton.click(); // call search action
	};

	const submitCallback = () => {
		return async ({
			result
		}: {
			formData: FormData;
			result: ActionResult;
			update: (opts?: any) => Promise<void>;
		}) => {
			isFinding = false; // reset UI state
			if (result.type === "failure") {
				// detect failure code
				console.log(`Fail status: ${result.status}`);
				if (result.status === 404) {
					showStatus("Canvas not found. Try another code?", true);
				} else {
					showStatus("An error occurred while searching for the canvas.", true);
				}
				animateFailure(inputField);
			} else if (result.type === "success" && result.data) {
				// canvas is found. Redirect
				const code = result.data?.canvas.backup_code;
				isFound = true;
				showStatus("We found that canvas. Redirecting you now...", false); // show success message
				window.location.href = `/canvas?c=${code}`;
			}
		};
	};

	onMount(() => {
		// reset ALL UI states
		isFinding = false;
		isFound = false;
		canvasCode = "";
		statusMsg = { flag: false, err: false, message: "" };
		if (inputField) {
			inputField.classList.add("no-anim"); // reset input field
		}
	});
</script>

<form id="hidden-form" method="POST" use:enhance={submitCallback}>
	<input name="canvasCode" type="text" bind:value={canvasCode} />
	<button bind:this={formSubmitButton} formaction="?/searchCanvas" />
</form>

<main>
	<section id="content">
		<h1>Find a canvas</h1>
		<p>
			Found a canvas that you can shit post on? Great. Go to your camera app or wherever you
			scan QR codes and scan the canvas QR code. You should be redirected back here where
			we'll check if the canvas you scanned is real, and you can start drawing your stuff.
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
		<form bind:this={inputField} id="input-wrapper" class="item-frame no-anim">
			<input bind:value={canvasCode} placeholder="a9Xk-72Bc-dF4m" maxlength="14" />
			<!-- must be in the format of xxxx-xxxx-xxxx -->
			<button
				type="submit"
				disabled={!codeFormat.test(canvasCode) || isFinding || isFound}
				class:full-opacity={isFinding || isFound}
				on:click={submit}
			>
				{#if isFound}
					<CircleCheck size={28} absoluteStrokeWidth={true} strokeWidth={2} />
				{:else if isFinding}
					<LoaderCircle size={28} class="animate-spin" />
				{:else}
					<RightArrowOutline s={32} />
				{/if}
			</button>
		</form>

		<section id="status-msg-container" class={`${statusMsg.flag ? "shown" : "hidden"}`}>
			<p class:err={statusMsg.err}>{statusMsg.message}&nbsp;</p>
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
		padding: 0px 30px;

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
			justify-content: center;
			align-items: center;
			column-gap: 10px;

			div {
				background-color: $text-tertiary;
				height: 5px;
				border-radius: 5px;

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

					&.full-opacity {
						opacity: 1 !important; // override disabled
					}
				}
			}
		}

		#status-msg-container {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;

			&.hidden {
				opacity: 0;
				pointer-events: none;
			}

			p {
				color: $text-secondary;

				&.err {
					color: $accent-error;
					animation: none;
				}
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

	#hidden-form {
		display: none;
	}
</style>
