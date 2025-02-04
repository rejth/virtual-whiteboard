import type { Bounds, Point } from 'core/interfaces';
import { geometryManager } from 'core/services';

export const isOverlapped = (layerBounds: Bounds, selectionPath: Point[]): boolean => {
  const selectionBounds = geometryManager.getPathBounds(selectionPath);
  if (!selectionBounds) return false;
  return geometryManager.isOverlapping(selectionBounds, layerBounds);
};
