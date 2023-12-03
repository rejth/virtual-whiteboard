import type { createEventDispatcher } from 'svelte';

import type { GeometryManager, RenderManager } from '.';

export const KEY = Symbol();

export type Context = {
  renderManager: RenderManager;
  geometryManager: GeometryManager;
};

export type Point = Pick<DOMRect, 'x' | 'y'>;
export type Dimension = Pick<DOMRect, 'width' | 'height'>;
export type RectPosition = Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>;
export type RectDimension = Point & Dimension;
export type PathBounds = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;

}

export interface Render {
  (props: {
    ctx: CanvasRenderingContext2D | null;
  }): void;
}

export type CanvasEvents =
  | 'click'
  | 'contextmenu'
  | 'wheel'
  | 'mousedown'
  | 'mousemove'
  | 'mouseup'
  | 'mouseenter'
  | 'mouseleave'
  | 'touchstart'
  | 'touchmove'
  | 'touchend'
  | 'touchcancel'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointercancel'
  | 'pointerenter'
  | 'pointerleave';


export type LayerEvents = Record<CanvasEvents, LayerEventDetails>
export type OriginalEvent = MouseEvent | PointerEvent | TouchEvent;

export type LayerEventDetails = {
  x: number;
  y: number;
  originalEvent: OriginalEvent;
};

export type LayerEventDispatcher = ReturnType<
  typeof createEventDispatcher<LayerEvents>
>;
