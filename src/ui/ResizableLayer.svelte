<script lang="ts">
  import { getContext } from 'svelte';

  import Surface from './ResizableLayerSurface.svelte';
  import Handler from './ResizableLayerHandler.svelte';
  import { type Point, type Context, KEY, W, E, N, S, SURFACE, HANDLERS } from '../lib';

  export let path: Point[];

  const { geometryManager } = getContext<Context>(KEY);

  let { x0, y0, x1, y1 } = geometryManager.getPathBounds(path);
  let draggedHandler: number | null = null;
  let hoveredHandler: number | null = null;
  let previousTouch: Touch;

  $: bounds = { x0, y0, x1, y1 };
  $: active = !!draggedHandler || !!hoveredHandler;

  $: getHandlerPosition = (handler: number): Point => {
    return {
      x: handler & W ? x0 : handler & E ? x1 : geometryManager.getMiddlePoint(x0, x1),
      y: handler & N ? y0 : handler & S ? y1 : geometryManager.getMiddlePoint(y0, y1),
    };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!draggedHandler) return;
    const { movementX, movementY } = e;
    x0 += draggedHandler & W && movementX;
    y0 += draggedHandler & N && movementY;
    x1 += draggedHandler & E && movementX;
    y1 += draggedHandler & S && movementY;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!draggedHandler) return;
    const { clientX, clientY } = e.touches[0];
    const movementX = clientX - previousTouch.clientX;
    const movementY = clientY - previousTouch.clientY;
    x0 += draggedHandler & W && movementX;
    y0 += draggedHandler & N && movementY;
    x1 += draggedHandler & E && movementX;
    y1 += draggedHandler & S && movementY;
    previousTouch = e.touches[0];
  };

  const onSurfaceMouseEnter = () => (hoveredHandler = SURFACE);
  const onHandlerMouseEnter = (handler: number) => (hoveredHandler = handler);

  const onSurfaceMouseDown = () => (draggedHandler = SURFACE);
  const onHandlerMouseDown = (handler: number) => (draggedHandler = handler);

  const onMouseLeave = () => (hoveredHandler = null);
  const onMouseUp = () => (draggedHandler = null);
  const onTouchStart = (e: TouchEvent) => (previousTouch = e.touches[0]);

  const cursor = (node: HTMLElement, _: unknown) => ({
    update: (cursorType: string) => (node.style.cursor = cursorType),
  });
</script>

<svelte:body
  use:cursor={active ? 'pointer' : 'auto'}
  on:mousemove={onMouseMove}
  on:mouseup={onMouseUp}
  on:touchstart={onTouchStart}
  on:touchmove={onTouchMove}
/>

<slot {bounds} />

<Surface
  {active}
  {bounds}
  on:mouseleave={onMouseLeave}
  on:mouseenter={onSurfaceMouseEnter}
  on:mousedown={onSurfaceMouseDown}
  on:touchstart={onSurfaceMouseDown}
/>

{#if active}
  {#each HANDLERS as handler (handler)}
    <Handler
      {...getHandlerPosition(handler)}
      active={hoveredHandler === handler || draggedHandler === handler}
      on:mouseleave={onMouseLeave}
      on:mouseenter={() => onHandlerMouseEnter(handler)}
      on:mousedown={() => onHandlerMouseDown(handler)}
      on:touchstart={() => onHandlerMouseDown(handler)}
    />
  {/each}
{/if}
