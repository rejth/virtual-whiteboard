import { createHitCanvas, EventManager, GeometryManager } from './index';
import {
  type HitCanvasRenderingContext2D,
  type OriginalEvent,
  type Render,
  type LayerId,
} from './types';

export class RenderManager {
  context: HitCanvasRenderingContext2D | null = null;

  hitCanvasObserver: MutationObserver | undefined;

  drawers: Map<LayerId, Render> = new Map();

  activeLayerId: LayerId = 0;

  eventManager: EventManager;

  geometryManager: GeometryManager;

  constructor() {
    this.eventManager = new EventManager();
    this.geometryManager = new GeometryManager();
  }

  init(canvas: HTMLCanvasElement) {
    const hitCanvas = new OffscreenCanvas(canvas.width, canvas.height);

    this.hitCanvasObserver = new MutationObserver(() => {
      hitCanvas.width = canvas.width;
      hitCanvas.height = canvas.height;
    });

    this.hitCanvasObserver.observe(canvas, { attributeFilter: ['width', 'height'] });
    this.context = createHitCanvas(canvas, hitCanvas);
  }

  addDrawer(layerId: LayerId, render: Render) {
    this.drawers.set(layerId, render);
  }

  removeDrawer(layerId: LayerId) {
    this.drawers.delete(layerId);
  }

  render() {
    this.drawers.forEach((draw, layerId) => {
      this.context!.setActiveLayerId(layerId);
      draw({ ctx: this.context! });
    });
  }

  clearRect(width: number, height: number) {
    this.context!.clearRect(0, 0, width, height);
  }

  handleEvent(e: OriginalEvent) {
    const { x, y } = this.geometryManager.calculatePosition(e);
    const layerId = this.context!.getLayerIdAt(x, y);
    this.eventManager.dispatchEvent(e, layerId, { x, y });
  }

  handleMouseEnterEvent(e: MouseEvent) {
    const { x, y } = this.geometryManager.calculatePosition(e);
    const layerId = this.context!.getLayerIdAt(x, y);

    if (this.activeLayerId === layerId) return;

    let pointerEvent: PointerEvent;
    let mouseEvent: MouseEvent;

    if (layerId) {
      this.activeLayerId = layerId;
      pointerEvent = new PointerEvent('pointerenter', e);
      mouseEvent = new MouseEvent('mouseenter', e);
    } else {
      pointerEvent = new PointerEvent('pointerleave', e);
      mouseEvent = new MouseEvent('mouseleave', e);
    }

    this.eventManager.dispatchEvent(pointerEvent, this.activeLayerId, { x, y });
    this.eventManager.dispatchEvent(mouseEvent, this.activeLayerId, { x, y });

    this.activeLayerId = layerId;
  }

  destroy() {
    this.hitCanvasObserver?.disconnect();
  }
}
