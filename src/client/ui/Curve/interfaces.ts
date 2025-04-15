import type { Point } from 'core/interfaces';

export const enum CurveLayerEvent {
  MOVE = 'point.move',
  ENTER = 'point.enter',
  TOUCH = 'point.touch',
  LEAVE = 'point.leave',
}

export interface CurveLayerEventDetails {
  index: number;
  point: Point;
}
