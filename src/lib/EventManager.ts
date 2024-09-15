import {
  type CanvasEvents,
  type LayerEventDetails,
  type LayerEventDispatcher,
  type LayerId,
} from './types';

export class EventManager {
  currentLayerId: LayerId;
  dispatchers: Map<LayerId, LayerEventDispatcher>;

  constructor() {
    this.currentLayerId = 0;
    this.dispatchers = new Map();
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

  dispatchEvent(layerId: LayerId, details: LayerEventDetails) {
    const dispatch = this.dispatchers.get(layerId);
    dispatch?.(<CanvasEvents>details.originalEvent.type, details);
  }
}
