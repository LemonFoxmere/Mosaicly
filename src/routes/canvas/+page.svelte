<script lang="ts">
    import Palette from "./palette.svelte";
    import Canvas from "./canvas.svelte";

    const colors = ["#fff", "#000", "#4fa9cc", "#3f8d27"];
</script>



<main>
    <Canvas></Canvas>
    <Palette {colors}></Palette>
</main>

<style lang="scss">

</style>