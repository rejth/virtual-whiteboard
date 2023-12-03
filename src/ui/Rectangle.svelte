<script lang="ts">
  import { getContext } from 'svelte';
  import { type Point, type LayerEventDetails, type Context, KEY } from '../lib';
  import Layer from './Layer.svelte';

  export let path: Point[];

  const { geometryManager } = getContext<Context>(KEY);

  $: render = ({ ctx }) => {
    const rect = geometryManager.getRectDimension(path);
    const { x, y, width, height } = rect;

    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'mediumturquoise';
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = 1;
  };

  const handleEvent = (e: LayerEventDetails) => {
    console.log('event on Rectangle: ', e)
  }
</script>
 
<Layer 
  {render} 
  on:mouseenter
  on:mouseleave
  on:mousedown={handleEvent}
  on:mouseup
  on:touchstart
  on:touchend
/>