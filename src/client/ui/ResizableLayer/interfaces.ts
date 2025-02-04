import type { Bounds } from 'core/interfaces';

export const enum ResizableLayerAction {
  RESIZE = 'resize',
  MOVE = 'move',
  ROTATE = 'rotate',
  SCALE = 'scale',
}

export interface ResizableLayerEventData {
  entityId: string;
  bounds: Bounds;
}
