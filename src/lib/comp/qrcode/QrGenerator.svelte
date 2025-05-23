<script lang="ts">
	import QRCode from "qrcode";

	let { QrSRC = "" } = $props();

	async function GenerateQR(QrSRC: string) {
		const exportedString = await QRCode.toDataURL(QrSRC);
		return exportedString;
	}
</script>

<div id="QR-Code">
	{#if QrSRC}
		{#await GenerateQR(QrSRC) then value}
			<img src={value} />
		{/await}
	{/if}
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
</style>
