<script lang="ts">
	import QrGenerator from "$lib/comp/qrcode/QrGenerator.svelte";
	import PdfExport from "$lib/comp/qrcode/PdfExport.svelte";

	let inputText = $state("");
	let finalText = $state(inputText);
</script>

<main>
	<h1>QR code generator testing</h1>
	<div>
		<input type="text" bind:value={inputText} placeholder="canvas code" />
		<button
			onclick={() => {
				finalText = inputText;
			}}>Submit</button
		>
	</div>
	<div id="QR-holder">
		<QrGenerator QrSRC={finalText}></QrGenerator>
	</div>
	<PdfExport QrSRC={finalText}></PdfExport>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#QR-holder {
		background: #fff;
		padding: 2px;
		border-radius: 5px;
	}
</style>
