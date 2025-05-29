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

	let forceOpen = $state(false); // stupid UI shit to prevent the window from closing when user is dragging text
</script>

<main
	class="no-drag"
	class:hidden={!open}
	onmouseup={() => {
		if (!forceOpen) {
			open = false;
		}
		forceOpen = false;
	}}
>
	<div
		class="modal-content"
		onmouseup={(e) => {
			e.stopPropagation();
			forceOpen = false;
		}}
		onmousedown={() => {
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
					type="button"
					class="none"
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
			transition-delay: 200ms;

			#title-container {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: flex-start;
				column-gap: 20px;

				#title-text-container {
					display: flex;
					flex-direction: column;

					#subtitle {
						padding-bottom: 20px; // pad for gap
					}
				}

				button {
					cursor: pointer !important;
				}
			}
		}
	}
</style>
