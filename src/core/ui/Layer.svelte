<script lang="ts">
  import { type LayerProps, registerLayer } from 'core/services';

  const layer: LayerProps = $props();
  const layerId = registerLayer(layer);
</script>

<div style:display="none" data-layer-id={layerId}></div>
