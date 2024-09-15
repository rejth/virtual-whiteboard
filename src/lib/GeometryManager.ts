import type { OriginalEvent, Bounds, Point, RectDimension } from './types';

export class GeometryManager {
  pixelRatio: number;
  defaultPoint: Point;

  constructor() {
    this.pixelRatio = 1;
    this.defaultPoint = { x: 0, y: 0 };
  }

  getMousePosition(e: MouseEvent): Point {
    return {
      x: e.offsetX,
      y: e.offsetY,
    };
  }

  getTouchPosition(e: TouchEvent, rect: DOMRect): Point {
    const { clientX, clientY } = e.changedTouches[0];
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  getPathBounds(path: Point[]): Bounds {
    const from = path[0] || this.defaultPoint;
    const to = path[path.length - 1] || this.defaultPoint;
    return { x0: from.x, y0: from.y, x1: to.x, y1: to.y };
  }

  getMiddlePoint(from: number, to: number): number {
    return (from + to) / 2;
  }

  calculatePosition(e: OriginalEvent): Point {
    if (window.TouchEvent && e instanceof TouchEvent) {
      const rect = (<Element>e.target).getBoundingClientRect();
      return this.getTouchPosition(e, rect);
    } else if (e instanceof MouseEvent) {
      return this.getMousePosition(e);
    }

    return this.defaultPoint;
  }

  getRectDimension(bounds: Bounds): RectDimension {
    const { x0, y0, x1, y1 } = bounds;
    return {
      x: Math.min(x0, x1),
      y: Math.min(y0, y1),
      width: Math.abs(x0 - x1),
      height: Math.abs(y0 - y1),
    };
  }
}
