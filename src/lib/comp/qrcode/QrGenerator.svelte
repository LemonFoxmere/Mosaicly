<!-- Just an image of a Qr Code when given a link -->

<script lang="ts">
	import QRCode from "qrcode";

	let { QrSRC = "" } = $props();
</script>

<div id="QR-Code">
	{#if QrSRC}
		{#await QRCode.toDataURL(QrSRC) then value}
			<img src={value} />
		{/await}
	{/if}
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#QR-Code {
		width: 60%;
		margin: auto;
		img {
			width: 100%;
			padding: 10px;
			display: block;
			margin: auto;
		}
	}
</style>
