<script lang="ts">
	import QrGenerator from "$lib/comp/qr-code/QRGenerator.svelte";

	let inputText = $state("wag");
	let finalText = $state(inputText);
</script>

<main>
	<h1>QR code generator testing</h1>
	<div>
		<input type="text" bind:value={inputText} placeholder="link to generate" />
		<button
			onclick={() => {
				finalText = inputText;
				console.log(finalText);
			}}>Submit</button
		>
	</div>
	<div id="QR-holder">
		<p>Where the QR code should be:</p>
		<QrGenerator QrSRC={finalText}></QrGenerator>
	</div>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#QR-holder {
		background: #fff;
		padding: 2px;
		border-radius: 5px;
	}
</style>
