import { writable, type Writable } from 'svelte/store';

import type { Point } from 'core/interfaces';
import type { CanvasContext, Renderer } from 'core/services';

export interface ActiveLayer {
  id: symbol;
  name: string;
}

export interface RenderProps {
  ctx: CanvasContext;
  renderer: Renderer;
  width: number;
  height: number;
  active: () => boolean;
}

export interface Render {
  (data: RenderProps): void;
}

export const position: Writable<Point> = writable({ x: 0, y: 0 });
export const activeLayer: Writable<ActiveLayer | null> = writable(null);
