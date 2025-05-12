<script lang="ts">
	import QrGenerator from "$lib/comp/qr-code/QRGenerator.svelte";

	let inputQR = $state("wag");

	function GenerateQR(link: string) {
		return "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + link;
	}

	let qrSRC = "";
</script>

<main>
	<h1>QR code generator testing</h1>
	<div>
		<input type="text" bind:value={inputQR} placeholder="link to generate" />
		<button
			onclick={() => {
				qrSRC = GenerateQR(inputQR);
				console.log(qrSRC);
			}}>Submit</button
		>
	</div>
	<div id="QR-holder">
		<p>Here is where the QR code should be:</p>
		<QrGenerator {qrSRC}></QrGenerator>
	</div>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	#QR-holder {
		background: #fff;
		padding: 2rem;
		border-radius: 0.75rem;
	}
</style>
