<script lang="ts">
  import { getContext } from 'svelte';

  import { type Point, type LayerEventDetails, type Context, KEY, type RenderProps } from '../lib';
  import Layer from './Layer.svelte';

  export let path: Point[];

  const { geometryManager } = getContext<Context>(KEY);

  $: render = ({ ctx }: RenderProps) => {
    if (!ctx) return;

    const { x, y, width, height } = geometryManager.getRectDimension(path);

    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'tomato';
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = 1;
  };

  const handleEvent = (e: CustomEvent<LayerEventDetails>) => {
    console.log('event on Rectangle: ', e);
  };
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
