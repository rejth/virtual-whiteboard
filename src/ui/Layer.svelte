<script lang="ts">
  import { getContext, onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { type Render, type LayerEvents, type Context, KEY } from '../lib';

  export let render: Render;
  export const getLayerElement = (): HTMLElement => layerRef;

  let layerRef: HTMLElement;

  const { renderManager } = getContext<Context>(KEY);
  const { layerManager } = renderManager;

  const dispatcher = createEventDispatcher<LayerEvents>();
  const { id, unregister } = layerManager.register(dispatcher);

  onMount(() => {
    layerManager.init(layerRef);
    renderManager.addDrawer(id, render);
  });

  onDestroy(() => {
    unregister();
    renderManager.removeDrawer(id);
  });
</script>
