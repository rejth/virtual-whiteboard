import {
  type CanvasEvents,
  type LayerEventDispatcher,
  type LayerId,
  type OriginalEvent,
  type Point,
} from '.';

export class EventManager {
  currentLayerId: LayerId = 0;

  eventDispatchers: Map<LayerId, LayerEventDispatcher> = new Map();

  register(dispatch: LayerEventDispatcher) {
    this.eventDispatchers.set(++this.currentLayerId, dispatch);

    return {
      id: this.currentLayerId,
      unregister: () => this.unregister(this.currentLayerId),
    };
  }

  unregister(layerId: LayerId): boolean {
    return this.eventDispatchers.delete(layerId);
  }

  dispatchEvent(e: OriginalEvent, layerId: LayerId, point: Point) {
    if (!layerId) return;
    const dispatch = this.eventDispatchers.get(layerId);
    dispatch?.(<CanvasEvents>e.type, { originalEvent: e, ...point });
  }
}
