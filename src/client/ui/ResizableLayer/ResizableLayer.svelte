<script lang="ts">
  import { onMount } from 'svelte';

  import type { Point, Bounds } from 'core/interfaces';
  import { geometryManager, type LayerEvent } from 'core/services';

  import type { BaseCanvasEntity } from 'client/ui/Canvas/BaseCanvasEntity';
  import type { RectDrawOptions } from 'client/ui/Canvas/CanvasRect';
  import { DEFAULT_SCALE } from 'client/shared/constants';
  import { canvasStore } from 'client/ui/Canvas/store';
  import When from 'client/ui/When/When.svelte';

  import Surface from './ResizableLayerSurface.svelte';
  import Handler from './ResizableLayerHandler.svelte';
  import { ResizableLayerAction, type ResizableLayerEventData } from './interfaces';
  import { isOverlapped } from './utils';

  interface Props {
    entityId: string;
    initialBounds?: Bounds;
    selectionPath?: Point[];
    isSelected?: boolean;
    selectOnMakingConnection?: boolean;
    isMovingBlocked?: boolean;
    onmousedown?: (detail: LayerEvent) => void;
    ontouchstart?: (detail: LayerEvent) => void;
    onlayerenter?: (detail: ResizableLayerEventData) => void;
    onlayertouch?: (detail: ResizableLayerEventData) => void;
    onlayeractive?: (detail: ResizableLayerEventData) => void;
    onlayerleave?: (detail: ResizableLayerEventData) => void;
    onlayermove?: (detail: ResizableLayerEventData) => void;
    onlayerdblclick?: (detail: ResizableLayerEventData & { event: LayerEvent }) => void;
  }

  let {
    entityId,
    initialBounds = { x0: 0, y0: 0, x1: 0, y1: 0 },
    selectionPath = [],
    isSelected = false,
    selectOnMakingConnection = false,
    isMovingBlocked = false,
    onmousedown,
    ontouchstart,
    onlayerenter,
    onlayertouch,
    onlayeractive,
    onlayerleave,
    onlayermove,
    onlayerdblclick,
  }: Props = $props();

  const { shapes } = canvasStore;

  const [N, S, W, E] = [1, 2, 4, 8];
  const HANDLERS = [N | W, N | E, S | W, S | E];
  const SURFACE = N | S | W | E;

  let { x0, y0, x1, y1 } = $state(initialBounds);
  let draggedHandler: number | null = $state(null);
  let hoveredHandler: number | null = $state(null);
  let currentAction: ResizableLayerAction | null = $state(null);
  let scale = $state(DEFAULT_SCALE);
  let previousTouch: Touch;

  let bounds = $derived({ x0, y0, x1, y1 });
  let overlapped = $derived(isOverlapped(bounds, selectionPath));
  let touched = $derived(Boolean(draggedHandler || hoveredHandler));
  let active = $derived(touched || overlapped || isSelected);

  let shape = $derived($shapes.get(entityId) as BaseCanvasEntity<RectDrawOptions>);
  let options = $derived(shape?.getOptions());
  let initialWidth = $derived(options?.initialWidth ?? options?.width);
  let initialHeight = $derived(options?.initialHeight ?? options?.height);

  onMount(() => {
    onlayeractive?.({ entityId, bounds });
  });

  $effect(() => {
    if (touched || overlapped) {
      onlayeractive?.({ entityId, bounds });
    } else if (selectionPath.length > 0 && !overlapped) {
      onlayerleave?.({ entityId, bounds });
    }
  });

  const getHandlerPosition = (handler: number): Point => {
    return {
      x: handler & W ? x0 - 5 : handler & E ? x1 + 5 : 0,
      y: handler & N ? y0 - 5 : handler & S ? y1 + 5 : 0,
    };
  };

  const handlerCursor = (handler: number | null): string => {
    if (handler === SURFACE) return 'pointer';

    if (handler === (N | W) || handler === (S | E)) {
      return 'nwse-resize';
    } else if (handler === (N | E) || handler === (S | W)) {
      return 'nesw-resize';
    }

    return 'auto';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!draggedHandler || isMovingBlocked) return;

    const { movementX, movementY } = e;
    let x0t = bounds.x0 + (draggedHandler & W ? movementX : 0);
    let y0t = bounds.y0 + (draggedHandler & N ? movementY : 0);
    let x1t = bounds.x1 + (draggedHandler & E ? movementX : 0);
    let y1t = bounds.y1 + (draggedHandler & S ? movementY : 0);

    const { width, height } = geometryManager.getRectDimensionFromBounds({
      x0: x0t,
      y0: y0t,
      x1: x1t,
      y1: y1t,
    });

    const ceilWidth = Math.ceil(width);
    const ceilHeight = Math.ceil(height);

    if (ceilWidth < initialWidth || ceilHeight < initialHeight) return;

    x0 = x0t;
    y0 = y0t;
    x1 = x1t;
    y1 = y1t;

    if (draggedHandler === SURFACE) {
      currentAction = ResizableLayerAction.MOVE;
    } else {
      currentAction = ResizableLayerAction.RESIZE;
      scale = shape.getCalculatedScale(ceilWidth, ceilHeight);
    }

    onlayeractive?.({ entityId, bounds });
    onlayermove?.({ entityId, bounds });
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!draggedHandler || isMovingBlocked) return;
    const { clientX, clientY } = e.touches[0];
    const movementX = clientX - previousTouch.clientX;
    const movementY = clientY - previousTouch.clientY;
    x0 += draggedHandler & W && movementX;
    y0 += draggedHandler & N && movementY;
    x1 += draggedHandler & E && movementX;
    y1 += draggedHandler & S && movementY;
    previousTouch = e.touches[0];
    onlayeractive?.({ entityId, bounds });
    onlayermove?.({ entityId, bounds });
  };

  const onHandlerMouseEnter = (handler: number) => {
    hoveredHandler = handler;
  };

  const onHandlerMouseDown = (handler: number) => {
    draggedHandler = handler;
  };

  const onSurfaceMouseEnter = () => {
    hoveredHandler = SURFACE;
    onlayerenter?.({ entityId, bounds });
  };

  const onSurfaceMouseDown = () => {
    draggedHandler = SURFACE;
    onlayeractive?.({ entityId, bounds });
    onlayertouch?.({ entityId, bounds });
  };

  const onMouseLeave = (e: LayerEvent) => {
    if (e.originalEvent.type === 'layer.mouseleave') {
      hoveredHandler = null;
      onlayerleave?.({ entityId, bounds });
    }
  };

  const onMouseUp = () => {
    draggedHandler = null;
  };

  const onTouchStart = (e: TouchEvent) => {
    previousTouch = e.touches[0];
  };

  const onDoubleClick = (e: LayerEvent) => {
    onlayerdblclick?.({ event: e, entityId, bounds });
  };

  const updateEntityData = () => {
    const rect = geometryManager.getRectDimensionFromBounds(bounds);
    canvasStore.updateShape(entityId, { ...rect, scale });
  };

  const cursor = (node: HTMLElement, _: unknown) => ({
    update: (cursorType: string) => (node.style.cursor = cursorType),
  });
</script>

<svelte:body
  use:cursor={handlerCursor(hoveredHandler ?? draggedHandler)}
  onmousemove={onMouseMove}
  onmouseup={onMouseUp}
  ontouchstart={onTouchStart}
  ontouchmove={onTouchMove}
  onpointerdown={onMouseUp}
/>

<Surface
  {entityId}
  {bounds}
  {scale}
  {active}
  {currentAction}
  {selectOnMakingConnection}
  onclick={updateEntityData}
  ondblclick={onDoubleClick}
  onmouseleave={onMouseLeave}
  onmouseenter={onSurfaceMouseEnter}
  onmousedown={(e) => {
    onSurfaceMouseDown();
    onmousedown?.(e);
  }}
  ontouchstart={(e) => {
    e.originalEvent.preventDefault();
    onSurfaceMouseDown();
    ontouchstart?.(e);
  }}
/>

<When isVisible={active && !selectOnMakingConnection}>
  {#each HANDLERS as handler (handler)}
    <Handler
      {...getHandlerPosition(handler)}
      active={hoveredHandler === handler || draggedHandler === handler}
      onclick={updateEntityData}
      onmouseleave={onMouseLeave}
      onmouseenter={() => onHandlerMouseEnter(handler)}
      onmousedown={(e) => {
        onHandlerMouseDown(handler);
        onmousedown?.(e);
      }}
      ontouchstart={(e) => {
        e.originalEvent.preventDefault();
        onHandlerMouseDown(handler);
        ontouchstart?.(e);
      }}
    />
  {/each}
</When>
