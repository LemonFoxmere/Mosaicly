<script lang="ts">
	let { QrSRC = "" } = $props();

	function GenerateQR(link: string) {
		return "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + link;
	}
</script>

<div id="QR-Code">
	<img src={GenerateQR(QrSRC)} />
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#QR-Code {
		width: 60%;
		border-radius: 5px;
		margin: auto;
		img {
			width: 100%;
			padding: 10px;
			display: block;
			margin: auto;
		}
	}
</style>
