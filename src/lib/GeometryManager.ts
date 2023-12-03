import type { OriginalEvent, PathBounds, Point, RectDimension } from './types';

export class GeometryManager {
  defaultPoint: Point = { x: 0, y: 0 };

  getMousePosition(e: MouseEvent | PointerEvent, rect: DOMRect): Point {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  getTouchPosition(e: TouchEvent, rect: DOMRect): Point {
    const { clientX, clientY } = e.changedTouches[0];
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  getPathBounds(path: Point[]): PathBounds {
    const from = path[0] ?? this.defaultPoint;
    const to = path[path.length - 1] ?? this.defaultPoint;
    return {
      x0: from.x,
      y0: from.y,
      x1: to.x,
      y1: to.y,
    };
  }

  getMiddlePoint(from: number, to: number): number {
    return (from + to) / 2;
  }

  calculatePosition(e: OriginalEvent): Point {
    const rect = (<Element>e.target).getBoundingClientRect();
    if (e instanceof TouchEvent) return this.getTouchPosition(e, rect);
    return this.getMousePosition(e, rect);
  }

  getRectDimension(path: Point[]): RectDimension {
    const { x0, y0, x1, y1 } = this.getPathBounds(path);
    return {
      x: Math.min(x0, x1),
      y: Math.min(y0, y1),
      width: Math.abs(x0 - x1),
      height: Math.abs(y0 - y1),
    };
  }

  getSvgPathFromStroke(stroke: number[][]): string {
    if (!stroke.length) return '';

    const d = stroke.reduce(
      (acc, [x0, y0], i, array) => {
        const [x1, y1] = array[(i + 1) % array.length];
        const middleX = this.getMiddlePoint(x0, x1);
        const middleY = this.getMiddlePoint(y0, y1);
        acc.push(x0, y0, middleX, middleY);
        return acc;
      },
      ['M', ...stroke[0], 'Q'],
    );

    d.push('Z');
    return d.join(' ');
  }
}
