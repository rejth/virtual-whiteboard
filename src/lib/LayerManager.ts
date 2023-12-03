import { type CanvasEvents, type LayerEventDispatcher, type OriginalEvent, type Point } from '.';

export class LayerManager {
  layerRef: HTMLElement | null = null;

  currentLayerId = 0;

  dispatchers: Map<number, LayerEventDispatcher> = new Map();

  init(ref: HTMLElement) {
    this.layerRef = ref;
  }

  register(dispatch: LayerEventDispatcher) {
    this.dispatchers.set(++this.currentLayerId, dispatch);

    return {
      id: this.currentLayerId,
      unregister: () => this.unregister(this.currentLayerId),
    };
  }

  unregister(layerId: number): boolean {
    return this.dispatchers.delete(layerId);
  }

  dispatchEvent(e: OriginalEvent, position: Point) {
    const layerId = this.layerRef?.getAttribute('data-layer-id');
    if (!layerId) return;

    const dispatch = this.dispatchers.get(+layerId);

    dispatch?.(<CanvasEvents>e.type, {
      ...position,
      originalEvent: e,
    });
  }
}
