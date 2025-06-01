<script lang="ts">
	import PdfExport from "$lib/comp/qrcode/PdfExport.svelte";
	import QrGenerator from "$lib/comp/qrcode/QrGenerator.svelte";

	let inputText = $state("a");
	let finalText = $state(inputText);

	// Remember: max name length 30
	const dummyLink = "https://mosaicly.io/search/" + finalText;
	const dummyName = "DUMMY NAME";
	const dummyCode = "DUMMY CODE";
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
	<PdfExport QrSRC={dummyLink} BackupCode={dummyCode} CanvasName={dummyName}></PdfExport>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#QR-holder {
		padding: 2px;
		border-radius: 5px;
	}
</style>
