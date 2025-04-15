import type { LayerManager } from 'core/services';

export type AppContext = {
  layerManager: LayerManager;
};

export type LayerId = number;
export type Point = Pick<DOMRect, 'x' | 'y'>;
export type Dimension = Pick<DOMRect, 'width' | 'height'>;
export type RectPosition = Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>;
export type RectDimension = Point & Dimension;

export type BBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type RectCorners = {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
};

export type PixelRatio = number;
export type Bounds = { x0: number; y0: number; x1: number; y1: number };
export type RGB = [number, number, number];

export interface HitCanvasRenderingContext2D extends Omit<CanvasRenderingContext2D, 'canvas'> {
  getLayerIdAt: (x: number, y: number) => number;
  setActiveLayerId: (id: LayerId) => void;
}

export type CanvasOptions = {
  width: number;
  height: number;
  initialPixelRatio: PixelRatio;
  pixelRatio: PixelRatio;
};

export interface RectDrawOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  shadowColor?: string;
  shadowOffsetY?: number;
  shadowOffsetX?: number;
  shadowBlur?: number;
}

export interface RoundedRectDrawOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  color: string;
  shadowColor?: string;
  shadowOffsetY?: number;
  shadowOffsetX?: number;
  shadowBlur?: number;
}

export interface StrokeDrawOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  lineWidth: number;
  color: string;
}

export interface CircleDrawOptions {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface QuadraticCurveDrawOptions {
  start: Point;
  control: Point;
  end: Point;
  color: string;
  lineWidth: number;
}

export interface BezierCurveDrawOptions {
  start: Point;
  cp1: Point;
  cp2: Point;
  end: Point;
  color: string;
  lineWidth: number;
}

export interface ImageDrawOptions {
  image: CanvasImageSource;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextDrawOptions {
  text: string;
  font: string;
  fontSize: number;
  fontStyle: string;
  textAlign: CanvasTextAlign;
  textDecoration: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface BackgroundPatternRendererData {
  ctx: OffscreenCanvasRenderingContext2D;
}

export interface BackgroundPatternRenderer {
  (data: BackgroundPatternRendererData): void;
}

export interface TransformationMatrix {
  translationX: number;
  translationY: number;
  scaleX: number;
  scaleY: number;
  skewY: number;
  skewX: number;
  initialScale: number;
}

export interface ClearRectOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}
