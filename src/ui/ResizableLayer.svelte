<script lang="ts">
  import { getContext } from 'svelte';

  import ResizableLayerSurface from './ResizableLayerSurface.svelte';
  import ResizableLayerHandler from './ResizableLayerHandler.svelte';
  import { type Point, type Context, KEY } from '../lib';

  export let path: Point[];

  const { geometryManager } = getContext<Context>(KEY);

  const [N, S, W, E] = [1, 2, 4, 8];
  const HANDLERS = [N, S, W, E, N | W, N | E, S | W, S | E];

  let active = true;

  const getHandlerPosition = (handler: number) => {
    const { x0, y0, x1, y1 } = bounds;
    return {
      x: handler & W ? x0 : handler & E ? x1 : geometryManager.getMiddlePoint(x0, x1),
      y: handler & N ? y0 : handler & S ? y1 : geometryManager.getMiddlePoint(y0, y1),
    };
  };

  $: bounds = geometryManager.getPathBounds(path);
</script>

<slot />

<ResizableLayerSurface {active} {path} />

{#if active}
  {#each HANDLERS as handler (handler)}
    <ResizableLayerHandler {active} {...getHandlerPosition(handler)} />
  {/each}
{/if}
