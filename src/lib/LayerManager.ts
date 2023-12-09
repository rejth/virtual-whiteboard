import {
  type CanvasEvents,
  type LayerEventDispatcher,
  type LayerId,
  type OriginalEvent,
  type Point,
} from '.';

export class LayerManager {
  layerRef: HTMLElement | null = null;

  currentLayerId: LayerId = 0;

  dispatchers: Map<LayerId, LayerEventDispatcher> = new Map();

  init(layer: HTMLElement) {
    this.layerRef = layer;
  }

  register(dispatch: LayerEventDispatcher) {
    this.dispatchers.set(++this.currentLayerId, dispatch);

    return {
      id: this.currentLayerId,
      unregister: () => this.unregister(this.currentLayerId),
    };
  }

  unregister(layerId: LayerId): boolean {
    return this.dispatchers.delete(layerId);
  }

  dispatchEvent(e: OriginalEvent, layerId: LayerId, point: Point) {
    const dispatch = this.dispatchers.get(layerId);
    dispatch?.(<CanvasEvents>e.type, { originalEvent: e, ...point });
  }
}
