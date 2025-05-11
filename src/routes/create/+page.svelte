<script lang="ts">
	import { goto } from "$app/navigation";
	import { enhance } from "$app/forms";
	import { fetchCoordinatesForDisplay } from "$lib/comp/canvas/utils/Geolocation";
	import type { ActionResult } from "@sveltejs/kit";

	// svelte 5 rune for managing component state reactively
	let currentStep = $state(1);

	let canvasName = $state("");
	let locationDescription = $state("");
	let canvasCoordinates = $state("");

	let formLatitude = $state("");
	let formLongitude = $state("");
	let formAccuracy = $state("");

	// holds a reference to the hidden form for programmatic submission
	let hiddenFormElement: HTMLFormElement | undefined;

	const stepSubtitles = $derived([
		"Step 1: Some basic stuff.",
		"Step 2: Where is that thing?",
		"Step 3: Plaster it all over."
	]);

	const nextStep = () => {
		if (currentStep < 3) {
			if (currentStep === 2) {
				console.log("Proceeding to final step. Data collected:", {
					canvasName,
					locationDescription,
					canvasCoordinates,
					formLatitude,
					formLongitude,
					formAccuracy
				});
			}
			currentStep++;
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			currentStep--;
		}
	};

	const handleLocateMeClick = async () => {
		console.log("Attempting to fetch coordinates...");
		const coords = await fetchCoordinatesForDisplay();
		if (coords) {
			canvasCoordinates = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
			formLatitude = String(coords.latitude);
			formLongitude = String(coords.longitude);
			formAccuracy = String(coords.accuracy);
			console.log("Coordinates updated:", {
				canvasCoordinates,
				formLatitude,
				formLongitude,
				formAccuracy
			});
		} else {
			console.log("Failed to fetch coordinates or permission denied.");
		}
	};

	// programmatically submits the hidden form
	const saveCanvas = async () => {
		if (hiddenFormElement) {
			// the bind:value on hidden inputs already keeps $state vars in sync
			// so no need to manually set titleInput.value etc here
			console.log("Attempting to save canvas...");
			hiddenFormElement.requestSubmit();
		} else {
			console.error("Hidden form element not found for submission.");
			alert("Error: Could not initiate save. Please try again.");
		}
	};

	// this is the callback for sveltekit's use:enhance
	// enhance progressively enhances the form submission
	const submitOptions = () => {
		return async ({
			formData,
			result,
			update
		}: {
			formData: FormData;
			result: ActionResult;
			update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
		}) => {
			console.log(
				"FormData before sending to server (geo data should be directly from form fields):",
				Object.fromEntries(formData.entries())
			);

			if (!formData.has("latitude") || !formData.has("longitude")) {
				console.warn(
					"Geolocation data (latitude/longitude) was not found in formData. This might be because it was not fetched in Step 2, or not set correctly."
				);
			}

			console.log("Form submission result (from server action):", result);

			// sveltekit uses 303 for form action redirects i learned
			if (
				result.type === "success" ||
				(result.type === "redirect" && result.status === 303)
			) {
				console.log("Canvas saved successfully or redirecting, navigating to profile.");
				goto("/profile");
			} else if (result.type === "error") {
				console.error("Error saving canvas (from server action):", result.error);
				alert(
					`Error saving canvas: ${result.error?.message || "An unknown server error occurred."}`
				);
			} else if (result.type === "failure") {
				console.error("Failed to save canvas (from server action):", result.data);
				alert(
					`Could not save canvas: ${result.data?.message || "Server indicated a failure."}`
				);
			} else {
				console.log(
					"Form submission completed with unhandled status/type (from server action):",
					result
				);
				goto("/profile");
			}
		};
	};
</script>

<main class="create-canvas-page">
	<h1 class="page-main-title">Ready for shitposting?</h1>

	{#if currentStep === 1}
		<section class="step step-1">
			<div class="step-header-scrollable">
				<div class="step-indicator-container">
					<div class="step-indicator">
						{#each [1, 2, 3] as stepNum}
							<div class="step-node-wrapper">
								<div
									class="step-circle"
									class:active={currentStep >= stepNum}
									class:current={currentStep === stepNum}
								></div>
								{#if stepNum < 3}
									<div
										class="step-line"
										class:active={currentStep > stepNum}
									></div>
								{/if}
							</div>
						{/each}
					</div>
					<p class="step-subtitle">{stepSubtitles[0]}</p>
				</div>
			</div>
			<p class="page-secondary-subtitle">Create a new canvas.</p>
			<div class="form-content">
				<label>
					<p class="label-text">Canvas Name</p>
					<input type="text" bind:value={canvasName} placeholder="Frog" required />
				</label>
				<label>
					<p class="label-text">
						Location Description <button type="button" class="tooltip-button"
							>(What is this?)</button
						>
					</p>
					<textarea
						rows="4"
						bind:value={locationDescription}
						placeholder="On the pole near the entrance of the Cowell dining hall."
						required
					></textarea>
				</label>
				<div class="navigation-buttons">
					<button type="button" class="next-button" onclick={nextStep}> → </button>
				</div>
			</div>
		</section>
	{/if}

	{#if currentStep === 2}
		<section class="step step-2">
			<div class="step-header-scrollable">
				<div class="step-indicator-container">
					<div class="step-indicator">
						{#each [1, 2, 3] as stepNum}
							<div class="step-node-wrapper">
								<div
									class="step-circle"
									class:active={currentStep >= stepNum}
									class:current={currentStep === stepNum}
								></div>
								{#if stepNum < 3}
									<div
										class="step-line"
										class:active={currentStep > stepNum}
									></div>
								{/if}
							</div>
						{/each}
					</div>
					<p class="step-subtitle">{stepSubtitles[1]}</p>
				</div>
			</div>
			<div class="form-content">
				<label>
					<p class="label-text">Canvas Coordinates</p>
					<div class="coordinate-input-wrapper">
						<input
							type="text"
							bind:value={canvasCoordinates}
							placeholder="36.99979, 122.06337"
							required
						/>
						<button type="button" class="locate-button" onclick={handleLocateMeClick}>
							🎯
						</button>
					</div>
				</label>

				<div class="map-placeholder">
					<p>Parsed as {canvasCoordinates || "[Coordinates will appear here]"}</p>
				</div>

				<div class="navigation-buttons">
					<button type="button" class="back-button" onclick={prevStep}> ← </button>
					<button type="button" class="next-button" onclick={nextStep}> → </button>
				</div>
			</div>
		</section>
	{/if}

	{#if currentStep === 3}
		<section class="step step-3">
			<div class="step-header-scrollable">
				<div class="step-indicator-container">
					<div class="step-indicator">
						{#each [1, 2, 3] as stepNum}
							<div class="step-node-wrapper">
								<div
									class="step-circle"
									class:active={currentStep >= stepNum}
									class:current={currentStep === stepNum}
								></div>
								{#if stepNum < 3}
									<div
										class="step-line"
										class:active={currentStep > stepNum}
									></div>
								{/if}
							</div>
						{/each}
					</div>
					<p class="step-subtitle">{stepSubtitles[2]}</p>
				</div>
			</div>
			<p class="page-secondary-subtitle congratulatory-message">
				Congratulations, you did it. <br /> Your "<strong>{canvasName || "New"}</strong>"
				canvas was created successfully, and is now visible to the public. If people can
				find where you put your QR code, they will be able to scan it and draw on your
				canvas.
			</p>

			<div class="whats-next-section">
				<h3>What's next?</h3>
				<p>
					Click one of the buttons below to get a QR code of your canvas. You need to get
					this code into the real world somehow (most people like to print it out) and
					stick it to where your canvas coordinate is.
				</p>
				<div class="action-buttons-group">
					<button type="button" class="action-button image-button" disabled>
						Image
					</button>
					<button type="button" class="action-button pdf-button" disabled> PDF </button>
				</div>
			</div>

			<div class="navigation-buttons step-3-nav">
				<button type="button" class="return-button full-width-button" onclick={saveCanvas}>
					Save and Return to Canvas List
				</button>
			</div>
		</section>
	{/if}

	<!-- this form is hidden and submitted programmatically via saveCanvas -->
	<!-- it uses sveltekit's enhance for a smoother ux -->
	<form
		method="post"
		action="/api/canvas?/createCanvas"
		use:enhance={submitOptions}
		bind:this={hiddenFormElement}
		style="display: none;"
	>
		<input type="hidden" name="title" value={canvasName} />
		<input type="hidden" name="loc_desc" value={locationDescription} />
		<input type="hidden" name="latitude" bind:value={formLatitude} />
		<input type="hidden" name="longitude" bind:value={formLongitude} />
		<input type="hidden" name="accuracy" bind:value={formAccuracy} />
	</form>
</main>

<style lang="scss">
	// these import shared styles and variables
	@use "$static/stylesheets/guideline" as *;
	@use "$static/stylesheets/fonts";

	.create-canvas-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		padding-top: $navbar-height + 20px;
		min-height: 100vh;
		background-color: $background-primary;
		color: $text-primary;
		width: 100%;
		max-width: $global-max-width;
		margin: 0 auto;
	}

	.page-main-title {
		@extend h1;
		font-weight: 800;
		font-size: 32px;
		line-height: 1.2;
		text-align: left;
		width: 100%;
		margin-bottom: 20px;
	}

	.step-header-scrollable {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: 100%;
		margin-bottom: 20px;
	}

	.step-indicator-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: 100%;
	}

	.step-indicator {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0px;

		.step-node-wrapper {
			display: flex;
			align-items: center;
		}

		.step-circle {
			width: 12px;
			height: 12px;
			border-radius: 50%;
			background-color: transparent;
			border: 2px solid rgba($text-primary, 0.3);
			transition: all 0.3s ease;

			&.active {
				background-color: $text-primary;
				border-color: $text-primary;
			}
		}

		.step-line {
			height: 2px;
			width: 40px;
			background-color: rgba($text-primary, 0.3);
			transition: background-color 0.3s ease;

			&.active {
				background-color: $text-primary;
			}
		}
	}

	.step-subtitle {
		@extend p;
		font-size: 16px;
		font-weight: 600;
		color: $text-primary;
		text-align: center;
	}

	.step {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 15px;

		.page-secondary-subtitle {
			@extend p;
			font-size: 16px;
			color: $text-secondary;
			text-align: left;
		}
	}

	.form-content {
		display: flex;
		flex-direction: column;
		gap: 25px;

		label {
			display: flex;
			flex-direction: column;
			gap: 8px;

			.label-text {
				@extend p;
				font-weight: 600;
				color: $text-primary;
				display: flex;
				align-items: center;
				gap: 5px;
			}

			.tooltip-button {
				@extend button;
				all: unset;
				display: inline;
				text-decoration: underline;
				color: $text-tertiary;
				cursor: help;
				font-size: inherit;
				padding: 0;
				margin: 0;
				height: auto;
				background: none;
				&:hover {
					opacity: 0.7;
				}
			}

			input[type="text"],
			textarea {
				background-color: transparent;
				border: 1.5px solid $text-primary;
				border-bottom-width: 4px;
				color: $text-primary;

				&::placeholder {
					color: $text-tertiary;
				}
				&:focus {
					border-color: $text-primary;
					box-shadow: none;
				}
			}
			textarea {
				padding: 15px 20px;
			}
		}

		.coordinate-input-wrapper {
			display: flex;
			align-items: center;
			gap: 10px;

			input[type="text"] {
				flex-grow: 1;
			}

			.locate-button {
				@extend button, .outline;
				border-radius: 8px;
				width: auto;
				height: 60px;
				padding: 0 15px;
				min-width: 50px;
				font-size: 20px;
			}
		}

		.map-placeholder {
			width: 100%;
			height: 200px;
			background-color: rgba($text-primary, 0.1);
			border: 1.5px solid $text-primary;
			border-radius: 8px;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 10px 0 20px;

			p {
				@extend .caption;
				color: $text-tertiary;
			}
		}
	}

	.navigation-buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
		padding-top: 20px;
		width: 100%;

		.next-button,
		.back-button {
			@extend button, .outline;
			border-radius: 50%;
			width: 50px;
			height: 50px;
			padding: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 24px;
		}
		.next-button {
			margin-left: auto;
		}
	}

	.step-3 {
		.page-secondary-subtitle.congratulatory-message {
			margin-top: 20px;
			margin-bottom: 25px;
			strong {
				font-weight: 700;
				color: $text-primary;
			}
		}

		.whats-next-section {
			display: flex;
			flex-direction: column;
			gap: 10px;
			margin-top: 20px;
			padding: 20px;
			background-color: rgba($text-primary, 0.05);
			border-radius: 8px;

			h3 {
				font-size: 18px;
				font-weight: 700;
				color: $text-primary;
				margin-bottom: 5px;
			}
			p {
				font-size: 14px;
				line-height: 1.5;
				color: $text-secondary;
			}
		}

		.action-buttons-group {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 15px;
			margin-top: 15px;

			.action-button {
				@extend button, .outline;
				border-radius: 8px;
				height: 100px;
				font-size: 16px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 8px;

				&.image-button::before {
					content: "🖼️";
					font-size: 24px;
				}
				&.pdf-button::before {
					content: "📄";
					font-size: 24px;
				}
			}
		}

		.step-3-nav {
			margin-top: 30px;
			justify-content: center;
			.return-button {
				@extend button;
				border-radius: 8px;
				width: 100%;
				max-width: 350px;
				height: 50px;
				padding: 11px 30px;
				font-size: 16px;
			}
		}
	}
</style>
