<!-- Just an image of a Qr Code when given a link -->

<script lang="ts">
	import { BASE_URL } from "$lib/@const/dynamic.env";
	import QRCode from "qrcode";
	import { onMount } from "svelte";

	let { QrSRC = "" } = $props();

	onMount(() => {
		console.log(BASE_URL);
	});
</script>

<div id="QR-Code">
	{#if QrSRC}
		{#await QRCode.toDataURL(QrSRC, { scale: 300 }) then value}
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

			image-rendering: pixelated;
		}
	}
</style>
