<script lang="ts">
    import Canvas from "./canvas.svelte";
    import Palette from "./palette.svelte";

    const colors = ["#ffffff", "#000000", "#ff0000", "#ffaa00", "#ffff00",
                    "#0fff00", "#00ffff", "#000fff", "#8000ff", "#f300ff"];
    let color = colors[0];
</script>

<main>
    <a href="./"> <button>Back</button> </a>
    <h1>Canvas</h1>
    <Palette
        {colors}
        ChangeColor={(_color) => {
            color = _color;
        }}
    >
    </Palette>
    <Canvas {color}></Canvas>
</main>

<style lang="scss">
    
</style>