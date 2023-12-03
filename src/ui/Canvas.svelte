<script lang="ts">
  import { setContext, onMount } from 'svelte';
  import { type OriginalEvent, type Context, KEY, RenderManager, GeometryManager } from '../lib';

  export let width: number;
  export let height: number;
  export let autoclear: boolean = true;

  export const getCanvasElement = (): HTMLCanvasElement => canvasRef;
  export const getCanvasContext = (): CanvasRenderingContext2D | null => renderManager.ctx;

  const renderManager = new RenderManager();
  const geometryManager = new GeometryManager();

  let canvasRef: HTMLCanvasElement;
  let frame: number;

  setContext<Context>(KEY, {
    renderManager,
    geometryManager,
  });

  onMount(() => {
    renderManager.init(canvasRef);
    frame = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(frame);
  });

  const draw = () => {
    if (autoclear) renderManager.clearRect(width, height);
    renderManager.render();
    frame = requestAnimationFrame(() => draw());
  };

  const handleEvent = (e: OriginalEvent) => {
    renderManager.handleEvent(e);
  };
</script>

<canvas
  class="canvas"
  {width}
  {height}
  bind:this={canvasRef}
  on:mousedown={handleEvent}
  on:mouseleave
  on:mouseup
  on:mouseenter
  on:mousemove
  on:pointerdown
  on:pointermove
  on:pointerup
  on:pointercancel
  on:touchstart
  on:touchmove
  on:touchend
  on:touchcancel
  on:wheel
  on:contextmenu
/>

<slot />
