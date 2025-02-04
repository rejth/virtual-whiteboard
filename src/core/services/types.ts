import type { Snippet } from 'svelte';
import type { Renderer } from 'core/services';
import type { Bounds } from 'core/interfaces';

export type LayerId = number;

export interface HitCanvasRenderingContext2D extends Omit<CanvasRenderingContext2D, 'canvas'> {
  getLayerIdAt: (x: number, y: number) => number;
  setActiveLayerId: (id: LayerId) => void;
}

export type CanvasContext = CanvasRenderingContext2D | HitCanvasRenderingContext2D;

export type LayerEvents =
  | 'click'
  | 'contextmenu'
  | 'dblclick'
  | 'auxclick'
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseup'
  | 'wheel'
  | 'touchcancel'
  | 'touchend'
  | 'touchmove'
  | 'touchstart'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointercancel';

export type LayerEventHandler = `on${LayerEvents}`;

type CanvasEvents =
  | LayerEvents
  | 'focus'
  | 'blur'
  | 'fullscreenchange'
  | 'fullscreenerror'
  | 'scroll'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'keydown'
  | 'keypress'
  | 'keyup'
  | 'mouseover'
  | 'mouseout'
  | 'select'
  | 'drag'
  | 'dragend'
  | 'dragenter'
  | 'dragstart'
  | 'dragleave'
  | 'dragover'
  | 'drop'
  | 'pointerover'
  | 'pointerout'
  | 'gotpointercapture'
  | 'lostpointercapture'
  | 'outclick';

export type CanvasEventHandler = `on${CanvasEvents}`;

export type CanvasEventHandlers = {
  [key in CanvasEventHandler]?: (event: Event) => void;
};

export type CanvasResizeEvent = {
  width: number;
  height: number;
  pixelRatio: number;
};

export type CanvasProps = CanvasEventHandlers & {
  width?: number;
  height?: number;
  pixelRatio?: number | 'auto';
  class?: string;
  style?: string;
  autoplay?: boolean;
  autoclear?: boolean;
  layerEvents?: boolean;
  handleEventsOnLayerMove?: boolean;
  clickOutsideExcludedIds?: string[];
  contextSettings?: CanvasRenderingContext2DSettings;
  onresize?: (detail: CanvasResizeEvent) => void;
  children?: Snippet;
};

export type CanvasConfig = {
  width: number;
  height: number;
  pixelRatio: number;
  autoplay: boolean;
  autoclear: boolean;
  layerEvents: boolean;
  handlers: CanvasEventHandlers;
  contextSettings?: CanvasRenderingContext2DSettings;
  onresize?: (detail: CanvasResizeEvent) => void;
};

export type LayerEvent = {
  x: number;
  y: number;
  originalEvent: MouseEvent | TouchEvent;
};

export type LayerEventHandlers = {
  [key in LayerEventHandler]?: (detail: LayerEvent) => void;
};

export interface Render {
  (data: RenderProps): void;
}

export type RenderProps = {
  ctx: CanvasContext;
  renderer: Renderer;
  width?: number;
  height?: number;
  time?: number;
};

export type LayerProps = { render: Render; bounds?: Bounds } & LayerEventHandlers;
