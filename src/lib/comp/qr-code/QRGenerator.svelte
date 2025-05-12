<script lang="ts">
	let { qrSRC = "" } = $props();
</script>

<img id="QR-Code" src={qrSRC} />

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;
</style>
