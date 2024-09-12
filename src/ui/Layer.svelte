<script lang="ts">
  import { getContext, onMount, onDestroy, createEventDispatcher, afterUpdate } from 'svelte';
  import { type Render, type LayerEvents, type Context, KEY } from '../lib';

  export let render: Render;

  const { renderManager } = getContext<Context>(KEY);
  const { eventManager } = renderManager;

  const dispatcher = createEventDispatcher<LayerEvents>();
  const { id, unregister } = eventManager.register(dispatcher);

  onMount(() => {
    renderManager.addDrawer(id, render);
  });

  onDestroy(() => {
    unregister();
    renderManager.removeDrawer(id);
  });

  afterUpdate(renderManager.redraw);
</script>
