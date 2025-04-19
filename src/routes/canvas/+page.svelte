<script lang="ts">
    import Palette from "./palette.svelte";
    import Canvas from "./canvas.svelte";

    const colors = ["#fff", "#000", "#4fa9cc", "#3f8d27"];
    let color = colors[0];
</script>

<main>
    <Canvas {color}></Canvas>
    <Palette {colors}
    on:color="{({ detail }) => {
        color = detail.color
        console.log(detail.color)
    }}">
    </Palette>
</main>

<style lang="scss">
</style>