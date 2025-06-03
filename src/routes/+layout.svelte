<script lang="ts">
	import MobileMenu from "$lib/comp/layout/MobileMenu.svelte";
	import MosaiclyLogo from "$lib/comp/ui/logos/MosaiclyLogo.svelte";
	import { onMount } from "svelte";
	import type { PageData } from "./$types";

	let { children, data }: { children: any; data: PageData } = $props();
	let { showLogo, showCta } = $derived(data.appearance!);
	let session = $derived(data.session);
	let user = $derived(data.user);

	let navbar: HTMLElement;
	let observer: IntersectionObserver;

	onMount(() => {
		observer = new IntersectionObserver(
			([e]) => e.target.classList.toggle("is-at-top", e.intersectionRatio >= 1),
			{ threshold: [1] }
		);

		observer.observe(navbar);
	});

	// mobile menu control
	let mobileMenuOpened = $state(false);
	const toggleMobileMenu = () => {
		mobileMenuOpened = !mobileMenuOpened;
	};
	const closeMobileMenu = () => {
		mobileMenuOpened = false;
	};
</script>

<main class="no-drag">
	<nav bind:this={navbar} id="navbar" class="no-drag is-at-top">
		<!-- <button class="small">Log in</button> -->
		{#if showLogo}
			<a class="wrapper item no-drag" href="/" on:click={closeMobileMenu}>
				<button class="none">
					<div id="logo"><MosaiclyLogo s={28} /></div>
				</button>
			</a>
		{/if}
		{#if showCta}
			{#if !session}
				<a class="wrapper item no-drag" href="/login">
					<button class="small">Log in</button>
				</a>
			{:else}
				<a class="wrapper item large no-drag" href="" on:click={toggleMobileMenu}>
					<button class="none">
						{#if user?.profile?.avatarUrl}
							<img
								class="no-drag"
								src={user.profile.avatarUrl}
								alt="Profile Picture"
								id="pfp"
							/>
						{:else}
							<button class="small outline no-drag">Profile</button>
						{/if}
					</button>
				</a>
			{/if}
		{/if}
	</nav>

	<MobileMenu {mobileMenuOpened} {closeMobileMenu}>
		<form class={mobileMenuOpened ? "" : "disabled"} id="mobile-cta" method="post">
			<a class="menu-items" href="/settings#profile" on:click={closeMobileMenu}>
				<p>Account & Profile</p>
			</a>

			<hr class="menu-items" />

			<a class="menu-items" href="/settings#canvas" on:click={closeMobileMenu}>
				<p>My Canvases</p>
			</a>

			<hr class="menu-items" />

			<a class="menu-items" href="/create" on:click={closeMobileMenu}>
				<p>Create a Canvas</p>
			</a>

			<hr class="menu-items" />

			<a class="menu-items" href="/search" on:click={closeMobileMenu}>
				<p>Search by Backup Code</p>
			</a>

			<hr class="menu-items" />

			<a class="menu-items" id="sign-out">
				<button class="none" formaction="/api/auth?/signout">
					<p>Sign Out</p>
				</button>
			</a>
		</form>
	</MobileMenu>

	<div id="content">
		{@render children()}
	</div>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	main {
		// border: 1px solid blue;
		width: 100%;
		min-height: 100%;
		height: fit-content;

		display: flex;
		flex-direction: column;
		align-items: center;

		#logo-text {
			font-weight: 500;
			font-size: 22px;
			color: $text-primary;
		}

		#navbar {
			background-color: $background-primary;

			position: sticky;
			top: -1px;
			z-index: 100;

			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

			padding: 2.5px 30px 0px 30px;

			width: 100%;
			max-width: 700px;
			min-height: 60px;
			height: $navbar-height;

			border-bottom: 1.5px solid $text-tertiary;
			transition: border-color 500ms $out-generic-expo;

			&.is-at-top {
				padding: 1px 30px 0px 30px;
				border-bottom: 1.5px solid transparent;
			}

			*:only-child {
				margin: 0 auto;
			}

			.item {
				display: flex;
				justify-content: center;
				align-items: center;

				&.large {
					width: 42px;
					height: 42px;
				}

				button {
					&.none {
						background-color: transparent !important;
					}
				}
			}

			#pfp {
				width: 100%;
				height: 100%;
				border-radius: 100px;
				object-fit: cover;
			}

			#logo {
				color: $text-primary;
			}
		}

		#mobile-cta {
			$stagger: 40ms; // Delay between animations
			width: 100%;

			.menu-items {
				width: 100%;
				display: flex;

				p {
					transition: transform 300ms $out-generic-expo;
					transform-origin: left;
				}
				&:active {
					p {
						transform: scale(0.925);
					}
				}

				button {
					color: inherit;
					transform-origin: left;

					&:active {
						transform: scale(0.925);
						background-color: transparent;
					}

					// for the button wrappers
					&.none {
						display: flex;
						flex-direction: row;
						align-items: center;
						width: 100%;
						height: 100%;
					}

					p {
						color: inherit;
					}
				}

				@for $i from 1 through 9 {
					// Change the number based on the number of buttons
					&:nth-child(#{$i}) {
						animation: fly-in 500ms $out-cubic #{($i - 1) * $stagger} forwards;
						animation-fill-mode: both;
					}
				}

				@keyframes fly-in {
					0% {
						opacity: 0;
						transform: translateY(15px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}
			}

			a {
				display: flex;
				flex-direction: row;
				align-items: center;
				height: 60px;
				padding: 0px 8px;

				cursor: pointer;
				color: $text-primary;

				box-sizing: border-box;
				text-decoration: none;
				transform-origin: left;

				transition: color 100ms $out-generic;

				&:active {
					color: $text-tertiary;
				}

				p {
					color: inherit;
				}
			}

			hr {
				margin: 0;
				height: 2px;
				width: 100%;

				border: none;
				background-color: $text-tertiary;
			}

			&.disabled {
				.menu-items {
					@for $i from 1 through 9 {
						// Change the number based on the number of buttons
						&:nth-child(#{$i}) {
							animation: fly-out 250ms $in-cubic #{($i - 1) * $stagger} forwards;
						}
					}

					@keyframes fly-out {
						0% {
							opacity: 1;
							transform: translateY(0);
						}
						100% {
							opacity: 0;
							transform: translateY(15px);
						}
					}
				}
			}
		}

		#content {
			display: flex;
			flex-grow: 1;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;

			width: 100%;
			height: 100%;
			max-width: $global-max-width;
		}

		@media screen and (min-width: $mobile-width) {
			justify-content: center;
		}
	}
</style>
