<script lang="ts">
  import { getContext, onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { type Render, type LayerEvents, type Context, KEY } from '../lib';

  export let render: Render;
  export const getLayerElement = () => layerRef;

  let layerRef: HTMLElement;

  const { renderManager } = getContext<Context>(KEY);
  const { layerManager } = renderManager;

  const dispatch = createEventDispatcher<LayerEvents>();
  const { id, unregister } = layerManager.register(dispatch);

  onMount(() => {
    layerManager.init(layerRef);
    renderManager.addDrawer(render);
  });

  onDestroy(() => {
    unregister();
    renderManager.removeDrawer(render);
  });
</script>

<div style:display="none" data-layer-id={id} bind:this={layerRef} />
