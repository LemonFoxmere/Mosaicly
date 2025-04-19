<script lang="ts">
	import { onMount } from "svelte";

    const background = '#fff'
    
    export let color = "#000";
    export let penSize = 1;

    let canvas;
    let context;
    onMount(() => {
        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");
        context.lineWidth = penSize;
    })
    

    let startPos = {};
    let isDrawing = false;
    const drawStart = (({ offsetX: x, offsetY: y }) => { 
		startPos = { x, y };
        isDrawing = true;

        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x-1, y)
		context.closePath()
		context.stroke()
	})

    const drawMove = (({ offsetX: _x, offsetY: _y }) => { 
        if(!isDrawing)
            return;

        const { x, y } = startPos;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(_x, _y)
		context.closePath()
		context.stroke()

        startPos = { x: _x, y: _y }
	})

    const drawEnd = (() => { 
		isDrawing = false
	})

</script>

<section>
    <canvas
        id="canvas"
        width="256px"
        height="256px"
        style:background
        bind:this={canvas} 
        on:mousedown={drawStart}
        on:mousemove={drawMove}
        on:mouseup={drawEnd}
    > </canvas>
</section>

<style lang="scss">
    canvas {
        margin-top: 15px;
    }
</style>