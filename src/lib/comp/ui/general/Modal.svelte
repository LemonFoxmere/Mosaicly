<script lang="ts">
	import CrossCircle from "../icons/CrossCircle.svelte";

	interface Props {
		opened: boolean;
		title?: string;
		subtitle?: string;
		showCloseButton?: boolean;
		children?: () => any;
	}
	let {
		opened: open = $bindable<boolean>(),
		title = $bindable<string>("New Modal"),
		subtitle = $bindable<string>(""),
		showCloseButton = $bindable<boolean>(true),
		children
	}: Props = $props();

	let closeButton: HTMLButtonElement;
	let simulatedCloseButtonPress = $state(false); // improve UX by triggering clicked aniamtion when clicking outside

	let forceOpen = $state(false); // stupid UI shit to prevent the window from closing when user is dragging text
</script>

<main
	class="no-drag"
	class:hidden={!open}
	onmousedown={() => (simulatedCloseButtonPress = true)}
	ontouchend={() => (simulatedCloseButtonPress = false)}
	ontouchstart={() => (simulatedCloseButtonPress = true)}
	onmouseup={() => {
		if (!forceOpen) {
			open = false;
		}
		forceOpen = false;
		simulatedCloseButtonPress = false;
	}}
>
	<div
		class="modal-content"
		ontouchstart={(e) => {
			e.stopPropagation();
		}}
		ontouchend={(e) => {
			e.stopPropagation();
		}}
		onmouseup={(e) => {
			e.stopPropagation();
			forceOpen = false;
		}}
		onmousedown={(e) => {
			e.stopPropagation();
			forceOpen = true;
		}}
	>
		<!-- Actual content -->
		<section id="title-container">
			{#if title}
				<section id="title-text-container">
					<p class="title">{title}</p>
					{#if subtitle}
						<p id="subtitle">{subtitle}</p>
					{/if}
				</section>
			{/if}
			{#if showCloseButton}
				<button
					bind:this={closeButton}
					id="close-button"
					class="none"
					class:sim-pressed={simulatedCloseButtonPress}
					onclick={() => {
						open = false;
					}}
				>
					<CrossCircle s={48} />
				</button>
			{/if}
		</section>

		{@render children?.()}
	</div>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		@extend .glass-light;

		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		padding: 15px;

		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 110;

		transition: opacity 500ms $out-generic-expo;

		// no scroll thru
		touch-action: none;
		* {
			touch-action: none;
		}

		&.hidden {
			transition-delay: 200ms;
			opacity: 0;
			pointer-events: none;

			.modal-content {
				opacity: 0;
				transform: translateY(50px);
				// transform: scale(0.9);
				transition-timing-function: $in-quad !important;
				transition-duration: 300ms !important;
				transition-delay: 0ms !important;
			}
		}

		.modal-content {
			@extend .item-frame;

			position: relative;
			background-color: $background-primary;
			padding: 30px;

			width: 100%;
			max-width: 700px;

			opacity: 1;
			transition: 500ms $out-generic-expo;
			transition-property: opacity transform;
			transition-delay: 100ms;

			#title-container {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: flex-start;
				column-gap: 20px;

				#title-text-container {
					display: flex;
					flex-direction: column;
					padding-bottom: 20px; // pad for gap if the content gets too tall

					#subtitle {
						// limit to 2 lines
						overflow: hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						line-clamp: 2;
					}
				}

				#close-button {
					border-radius: 100px;
					cursor: pointer !important;

					&.sim-pressed {
						opacity: 1;
						transform: scale(0.8);
						background-color: $text-active-highlight;
					}
				}
			}
		}
	}
</style>
