<script lang="ts">
  import { onMount } from 'svelte';

  import type { Point } from 'core/interfaces';
  import { type Camera, type LayerEvent } from 'core/services';
  import { dndWatcher } from 'core/lib';
  import { Canvas } from 'core/ui';

  import { Tools } from 'client/shared/interfaces';
  import { CURSORS } from 'client/shared/constants';

  import When from 'client/ui/When/When.svelte';
  import Zoom from 'client/ui/Zoom/Zoom.svelte';
  import Keyboard from 'client/ui/Keyboard/Keyboard.svelte';
  import Background from 'client/ui/Background/Background.svelte';
  import Selection from 'client/ui/Selection/Selection.svelte';
  import Toolbar from 'client/ui/Toolbar/Toolbar.svelte';
  import Connection from 'client/ui/Connection/Connection.svelte';
  import TextEditor from 'client/ui/TextEditor/TextEditor.svelte';
  import ResizableLayer from 'client/ui/ResizableLayer/ResizableLayer.svelte';
  import type { ResizableLayerEventData } from 'client/ui/ResizableLayer/interfaces';

  import { canvasStore } from 'client/ui/Canvas/store';
  import { toolbarStore } from 'client/ui/Toolbar/store';
  import { connectionStore } from 'client/ui/Connection/store';

  import 'client/shared/styles/_global.css';

  let canvas: Canvas;
  let camera: Camera | null = $state(null);
  let selection: Point[] = $state([]);
  let isLayerEntered = false;

  const { tool } = toolbarStore;
  const { shapes, selectionPath, textEditor, clickOutsideExcludedIds, isSelected } = canvasStore;
  const { currentConnection, connections } = connectionStore;

  let connection = $derived($tool === Tools.CONNECT);
  let panning = $derived($tool === Tools.PAN);
  let cursorStyle = $derived(panning ? `cursor: ${CURSORS.HAND}` : ``);

  $effect(() => {
    selection = $selectionPath.length > 0 ? $selectionPath : selection;
  });

  onMount(async () => {
    camera = canvas.getCamera();

    const ref = canvas.canvas;
    const rect = ref.getBoundingClientRect();
    const selectionWatcher = dndWatcher(ref);

    for await (const e of selectionWatcher) {
      const transformedPoint = camera?.handleCanvasClick(e as MouseEvent);
      canvasStore.dragSelection(e as MouseEvent, rect, transformedPoint!);
    }
  });

  const handleCanvasClick = (e: Event) => {
    if ($isSelected) return;
    const transformedPoint = camera?.handleCanvasClick(e as MouseEvent);

    canvasStore.addShape(e as MouseEvent, transformedPoint!);
    selection = $selectionPath;
    canvasStore.resetSelection();
  };

  const handleCanvasMouseDown = (e: Event) => {
    if (!panning) return;
    camera?.handleMouseDown(e as MouseEvent);
  };

  const handleCanvasMouseUp = (e: Event) => {
    if (!panning) return;
    camera?.handleMouseUp(e as MouseEvent);
  };

  const handleCanvasMouseMove = (e: Event) => {
    if ($textEditor) return;
    camera?.handleMouseMove(e as MouseEvent);
    if (isLayerEntered) return;
    const transformedPoint = camera?.handleCanvasClick(e as MouseEvent);
    connectionStore.handleCanvasMouseMove(transformedPoint!);
  };

  const handleCanvasWheel = (e: Event) => {
    if ($textEditor) return;
    camera?.handleWheelChange(e as WheelEvent);
  };

  const handleLayerMouseDown = () => {
    canvasStore.setIsSelected(true);
  };

  const handleLayerActive = (data: ResizableLayerEventData) => {
    canvasStore.selectShape(data.entityId);
  };

  const handleLayerLeave = (data: ResizableLayerEventData) => {
    canvasStore.deselectShape(data.entityId);
    canvasStore.setIsSelected(false);
    canvasStore.saveText();
    isLayerEntered = false;
  };

  const handleLayerTouch = (data: ResizableLayerEventData) => {
    connectionStore.handleBoxSelect(data, data.entityId);
  };

  const handleLayerMove = (data: ResizableLayerEventData) => {
    connectionStore.handleBoxMove(data, data.entityId);
  };

  const handleLayerEnter = (data: ResizableLayerEventData) => {
    isLayerEntered = true;
    connectionStore.handleBoxEnter(data, data.entityId);
  };

  const handleLayerDoubleClick = (e: ResizableLayerEventData & { event: LayerEvent }) => {
    if (connection || !e.event) return;
    const { entityId, bounds } = e;
    const transformedPoint = camera?.handleLayerDoubleClick(e.event, bounds);
    canvasStore.initTextEditor(entityId, transformedPoint!);
  };
</script>

<main>
  <Toolbar />
  <Zoom />
  <Keyboard />
  <When isVisible={Boolean($textEditor?.isEditable)}>
    <TextEditor
      anchorId={$textEditor?.anchorId}
      position={$textEditor?.position}
      transform={camera?.renderer?.getTransform()}
    />
  </When>
  <Canvas
    bind:this={canvas}
    layerEvents={!panning}
    handleEventsOnLayerMove={connection}
    {clickOutsideExcludedIds}
    width={window.innerWidth}
    height={window.innerHeight}
    style={cursorStyle}
    onoutclick={() => (selection = [])}
    onclick={handleCanvasClick}
    onmousemove={handleCanvasMouseMove}
    onmousedown={handleCanvasMouseDown}
    onmouseup={handleCanvasMouseUp}
    onwheel={handleCanvasWheel}
  >
    <Background />
    <When isVisible={$tool === Tools.SELECT}>
      <Selection path={$selectionPath} />
    </When>
    <When isVisible={connection && Boolean($currentConnection)}>
      <Connection source={$currentConnection?.source} target={$currentConnection?.target} />
    </When>
    {#each $connections.entries() as [connectionId, { source, target }] (connectionId)}
      <Connection {connectionId} {source} {target} selectOnMakingConnection={connection} />
    {/each}
    {#each $shapes.values() as shape (shape.id)}
      <ResizableLayer
        entityId={shape.id}
        initialBounds={shape.getBounds()}
        isSelected={shape.isSelected}
        selectionPath={selection}
        selectOnMakingConnection={connection}
        isMovingBlocked={connection}
        onmousedown={handleLayerMouseDown}
        onlayerenter={handleLayerEnter}
        onlayertouch={handleLayerTouch}
        onlayeractive={handleLayerActive}
        onlayerleave={handleLayerLeave}
        onlayermove={handleLayerMove}
        onlayerdblclick={handleLayerDoubleClick}
      />
    {/each}
  </Canvas>
</main>
