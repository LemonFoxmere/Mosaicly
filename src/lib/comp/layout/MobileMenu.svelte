<script lang="ts">
	let {
		mobileMenuOpened,
		closeMobileMenu
	}: {
		mobileMenuOpened: boolean;
		closeMobileMenu: () => void;
	} = $props();
</script>

<main>
	<div
		id="mobile-menu"
		class={mobileMenuOpened ? "" : "disabled"}
		ontouchmove={(e) => {
			e.preventDefault();
			e.stopPropagation();
		}}
		onclick={closeMobileMenu}
	>
		<div id="menu-bg" onclick={(e) => e.stopPropagation()}>
			<slot />
		</div>
	</div>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#mobile-menu {
		@extend .glass-light;

		width: 100%;
		max-width: 100%;
		height: calc(100% - $navbar-height);
		position: fixed;
		top: $navbar-height;
		left: 0;
		z-index: 100;

		overflow: hidden;
		pointer-events: all; // capture close event when clicked outside (i.e., the backdrop)

		transition: 500ms $out-cubic;
		transition-property:
			backdrop-filter,
			-webkit-backdrop-filter,
			opacity;

		#menu-bg {
			@extend .item-frame;

			width: calc(100% - 30px);
			max-width: $global-max-width;
			height: fit-content;
			box-sizing: border-box;
			padding: 0 20px 10px 20px;
			margin: 0px auto; // center

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			justify-content: flex-start;

			background-color: $background-primary;
			border-radius: 8px;

			transform: translateY(0px);
			transform-origin: top;
			transition: 1000ms $out-expo;
			transition-property: transform;

			min-height: 50px;
		}

		&.disabled {
			opacity: 0;
			pointer-events: none;

			transition: 300ms $in-cubic;
			transition-property:
				backdrop-filter,
				-webkit-backdrop-filter,
				opacity;

			#menu-bg {
				transform: translateY(20px);
				transition: 300ms $in-cubic;
			}
		}

		@media screen and (max-width: $mobile-width) {
			top: $navbar-height;
		}
	}
</style>
