<script lang="ts">
  import { setContext, onMount } from 'svelte';
  import {
    type HitCanvasRenderingContext2D,
    type OriginalEvent,
    type Context,
    RenderManager,
    GeometryManager,
    KEY,
  } from '../lib';

  export let width: number;
  export let height: number;
  export let autoclear: boolean = true;
  export let className: string;

  export const getCanvasElement = (): HTMLCanvasElement => canvas;
  export const getCanvasContext = (): HitCanvasRenderingContext2D | null => renderManager.context;

  const renderManager = new RenderManager();
  const geometryManager = new GeometryManager();

  let canvas: HTMLCanvasElement;
  let frame: number;

  setContext<Context>(KEY, {
    renderManager,
    geometryManager,
  });

  onMount(() => {
    renderManager.init(canvas);
    frame = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(frame);
  });

  const draw = () => {
    if (autoclear) renderManager.clearRect(width, height);
    renderManager.render();
    frame = requestAnimationFrame(() => draw());
  };

  const handleMouseMoveEvent = (e: MouseEvent) => {
    renderManager.handleMouseEnterEvent(e);
  };

  const handleEvent = (e: OriginalEvent) => {
    renderManager.handleEvent(e);
  };
</script>

<canvas
  {width}
  {height}
  class={className}
  bind:this={canvas}
  on:click={handleEvent}
  on:mousedown={handleEvent}
  on:mouseup={handleEvent}
  on:mouseenter={handleEvent}
  on:mouseleave={handleEvent}
  on:mousemove={handleMouseMoveEvent}
  on:pointerdown={handleEvent}
  on:pointerup={handleEvent}
  on:pointerenter={handleMouseMoveEvent}
  on:pointerleave={handleEvent}
  on:pointermove={handleEvent}
  on:pointercancel={handleEvent}
  on:touchstart={handleEvent}
  on:touchend={handleEvent}
  on:touchmove={handleEvent}
  on:touchcancel={handleEvent}
  on:contextmenu
  on:wheel
  on:drag
  on:dragend
  on:dragenter
  on:dragstart
  on:dragleave
  on:dragover
  on:drop
/>

<slot />
