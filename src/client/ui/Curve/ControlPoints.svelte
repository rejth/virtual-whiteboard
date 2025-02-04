<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { Point } from 'core/interfaces';
  import { geometryManager } from 'core/services';

  import { type CurveLayerEventDetails } from './interfaces';
  import ControlPoint from './Point.svelte';

  interface Props {
    controlPoints: Point[];
    selectOnMakingConnection?: boolean;
    children?: Snippet;
    onpointmove?: (details: CurveLayerEventDetails) => void;
    onpointtouch?: () => void;
    onpointleave?: () => void;
  }

  let {
    controlPoints,
    selectOnMakingConnection = false,
    children,
    onpointmove,
    onpointtouch,
    onpointleave,
  }: Props = $props();

  let selectedPoint: number | null = null;
  let draggedHandler: number | null = $state(null);
  let hoveredHandler: number | null = $state(null);
  let active = $derived(draggedHandler !== null || hoveredHandler !== null);

  const handleMouseLeave = () => {
    hoveredHandler = null;
    onpointleave?.();
  };

  const handleMouseUp = () => {
    draggedHandler = null;
    selectedPoint = null;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (selectedPoint === null) return;
    onpointmove?.({
      index: selectedPoint,
      point: geometryManager.calculatePosition(e),
    });
  };

  const handleMouseEnter = (handle: number) => {
    hoveredHandler = handle;
  };

  const handleMouseDown = (handle: number) => {
    draggedHandler = handle;
    selectedPoint = handle;
    onpointtouch?.();
  };

  const cursor = (node: HTMLElement, _: unknown) => ({
    update: (cursorType: string) => (node.style.cursor = cursorType),
  });
</script>

<svelte:body
  use:cursor={active && !selectOnMakingConnection ? 'pointer' : 'auto'}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
/>

{@render children?.()}

{#each controlPoints as point, index}
  <ControlPoint
    {point}
    active={!selectOnMakingConnection && (hoveredHandler === index || draggedHandler === index)}
    onmouseleave={handleMouseLeave}
    onmouseenter={() => handleMouseEnter(index)}
    onmousedown={() => handleMouseDown(index)}
  />
{/each}
