<script lang="ts">
	import QRCode from "qrcode";

	let { link = "test" } = $props();

	async function GenerateQR(link: string) {
		const exportedString = await QRCode.toDataURL(link);
		console.log(exportedString);
		return exportedString;
	}
</script>

<div id="QR-Code">
	<p>QR2</p>
	{#await GenerateQR(link) then value}
		<img src={value} />
	{/await}
</div>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
</style>
