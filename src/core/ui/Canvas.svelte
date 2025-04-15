<script lang="ts">
  import { onMount } from 'svelte';

  import { clickOutside } from 'core/lib';
  import type { PixelRatio } from 'core/interfaces';
  import {
    Camera,
    Renderer,
    LayerManager,
    createHitCanvas,
    getPixelRatio,
    type CanvasProps,
    type CanvasContext,
  } from 'core/services';

  let {
    width: _width,
    height: _height,
    pixelRatio: _pixelRatio,
    class: className,
    style = '',
    contextSettings,
    autoplay = false,
    autoclear = true,
    layerEvents = false,
    handleEventsOnLayerMove = false,
    clickOutsideExcludedIds = [],
    children,
    onresize,
    ...handlers
  }: CanvasProps = $props();

  const renderer = new Renderer();

  let canvas: HTMLCanvasElement;
  let context: CanvasContext;
  let layerRef: HTMLDivElement;

  let canvasWidth: number = $state(0);
  let canvasHeight: number = $state(0);
  let devicePixelRatio: PixelRatio = $state(2);

  const width = $derived(_width ?? canvasWidth);
  const height = $derived(_height ?? canvasHeight);
  const pixelRatio = $derived(getPixelRatio(_pixelRatio, devicePixelRatio, width, height));

  $effect(() => {
    renderer.width = width;
    renderer.height = height;
    renderer.pixelRatio = pixelRatio;
  });

  const layerManager = new LayerManager(renderer, {
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    get pixelRatio() {
      return pixelRatio;
    },
    get autoplay() {
      return autoplay;
    },
    get autoclear() {
      return autoclear;
    },
    get layerEvents() {
      return layerEvents;
    },
    get onresize() {
      return onresize;
    },
    handlers,
  });

  const camera = new Camera(layerManager);

  onMount(() => {
    if (layerEvents) {
      context = createHitCanvas(canvas, contextSettings);
    } else {
      context = canvas.getContext('2d', contextSettings)!;
    }

    let initialScale: PixelRatio = getPixelRatio(_pixelRatio, devicePixelRatio, width, height);

    context.scale(initialScale, initialScale);

    camera.init(context);
    renderer.init(context, initialScale);
    layerManager.init(context, layerRef);
  });

  const redraw = () => layerManager.redraw();
  const getCamera = () => camera;

  export { redraw, canvas, context, getCamera };
</script>

<svelte:window bind:devicePixelRatio />

<canvas
  use:clickOutside={{ exclude: clickOutsideExcludedIds }}
  bind:this={canvas}
  bind:clientWidth={canvasWidth}
  bind:clientHeight={canvasHeight}
  class={className}
  width={Math.floor(width * pixelRatio)}
  height={Math.floor(height * pixelRatio)}
  {style}
  style:width={_width ? `${_width}px` : '100%'}
  style:height={_height ? `${_height}px` : '100%'}
  {...layerManager.createEventHandlers(handleEventsOnLayerMove)}
></canvas>

<div style:display="none" bind:this={layerRef}>
  {@render children?.()}
</div>
