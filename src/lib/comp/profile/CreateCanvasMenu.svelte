<a href="/create" class="button">+ Canvas</a>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	a.button {
		padding: 11px 30px;
		height: 50px;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		background-color: $text-primary;
		color: $background-primary;
		border-radius: 8px;
		font-family: "Outfit", system-ui, Helvetica, sans-serif;
		font-size: 16px;
		line-height: 22px;
		font-weight: 400;
		cursor: pointer;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
		user-select: none;
		transition: opacity 300ms $out-generic-expo;

		&:hover {
			opacity: 0.7;
		}
		&:active {
			opacity: 0.8;
		}
	}
</style>
