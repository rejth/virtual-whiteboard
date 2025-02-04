<script lang="ts">
  import { Canvas } from 'core/ui';

  import When from 'client/ui/When/When.svelte';

  import Rect from './Rect.svelte';
  import Circle from './Circle.svelte';
  import Blob from './Blob.svelte';
  import Text from './Text.svelte';
  import Tooltip from './Tooltip.svelte';
  import { position, activeLayer } from './store';

  const handleMouseMove = (e: Event) => {
    $position = { x: (e as MouseEvent).offsetX, y: (e as MouseEvent).offsetY };
  };

  const handleTouch = (e: Event) => {
    e.preventDefault();
    const { left, top } = (e.target as Element).getBoundingClientRect();
    const { clientX, clientY } = (e as TouchEvent).changedTouches[0];
    $position = { x: clientX - left, y: clientY - top };
  };
</script>

<div>
  <Canvas
    layerEvents
    width={760}
    height={560}
    style="cursor: {$activeLayer ? 'pointer' : 'default'}"
    onmousemove={handleMouseMove}
    ontouchstart={handleTouch}
    ontouchmove={handleTouch}
  >
    <Rect />
    <Blob />
    <Circle />
    <Text text="Whiteboard X" yOffset={-0.03} scale={0.06} />
    <Text text="Another silly whiteboard" scale={0.0297} yOffset={0.04} opacity={0.7} />
    <When isVisible={Boolean($activeLayer?.id)}>
      <Tooltip />
    </When>
  </Canvas>
</div>

<style>
  div {
    overflow: hidden;
    position: relative;
    aspect-ratio: 5/3;
  }
</style>
