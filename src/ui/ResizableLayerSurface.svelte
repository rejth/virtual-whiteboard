<script lang="ts">
  import { getContext } from 'svelte';
  import Layer from './Layer.svelte';
  import { type Point, type LayerEventDetails, type Context, KEY } from '../lib';

  export let path: Point[];
  export let active: boolean;

  const { geometryManager } = getContext<Context>(KEY);

  $: render = ({ ctx }) => {
    const rect = geometryManager.getRectDimension(path);
    const { x, y, width, height } = rect;

    if (active) {
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }

    ctx.globalAlpha = 0;
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = 1;
  };

  const handleEvent = (e: LayerEventDetails) => {
    console.log('event on Surface: ', e)
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
