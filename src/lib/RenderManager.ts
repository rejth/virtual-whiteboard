import { COLORS, createHitCanvas, EventManager, GeometryManager } from './index';
import {
  type HitCanvasRenderingContext2D,
  type OriginalEvent,
  type Render,
  type LayerId,
  type Point,
  type LayerEventDetails,
  type CanvasEvents,
  type LayerEventDispatcher,
} from './types';

export class RenderManager {
  width?: number;
  height?: number;
  pixelRatio?: number;
  frame?: number;

  canvas: HTMLCanvasElement | null;
  context: HitCanvasRenderingContext2D | null;
  eventManager: EventManager;
  geometryManager: GeometryManager;

  drawers: Map<LayerId, Render>;
  activeLayerId: LayerId;
  needsRedraw: boolean;

  constructor() {
    this.canvas = null;
    this.context = null;
    this.eventManager = new EventManager();
    this.geometryManager = new GeometryManager();
    this.drawers = new Map();
    this.activeLayerId = 0;
    this.needsRedraw = true;
    this.render = this.render.bind(this);
    this.redraw = this.redraw.bind(this);
  }

  init(canvas: HTMLCanvasElement, contextSettings?: CanvasRenderingContext2DSettings) {
    this.canvas = canvas;
    this.context = createHitCanvas(canvas, contextSettings);
    this.startRenderLoop();
  }

  startRenderLoop() {
    this.render();
    this.frame = requestAnimationFrame(() => this.startRenderLoop());
  }

  /**
   * The main render function which is responsible for drawing, clearing and canvas's transformation matrix adjustment.
   * */
  render() {
    /**
     * Render canvas when width, height or pixelRatio change.
     */
    if (!this.needsRedraw) return;

    const context = this.context!;
    const width = this.width!;
    const height = this.height!;

    // TODO: replace "1" with pixelRatio
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);

    this.drawers.forEach((draw, layerId) => {
      context.setActiveLayerId(layerId);
      draw({ ctx: context, geometry: this.geometryManager });
    });

    this.needsRedraw = false;
  }

  /**
   * Forces canvas's transformation matrix adjustment to scale drawings according to the new width, height or device's pixel ratio.
   */
  redraw() {
    this.needsRedraw = true;
  }

  addDrawer(layerId: LayerId, render: Render) {
    this.drawers.set(layerId, render);
  }

  removeDrawer(layerId: LayerId) {
    this.drawers.delete(layerId);
  }

  /**
   * Handles "mousemove", "pointermove" and "touchstart" events on canvas to identify the corresponding layer and then dispatch the event to the Layer component.
   */

  setActiveLayer(e: OriginalEvent) {
    const point = this.geometryManager.calculatePosition(e);
    const layerId = this.context!.getLayerIdAt(point.x, point.y);

    if (this.activeLayerId === layerId) return;

    if (e instanceof MouseEvent) {
      this.eventManager.dispatchEvent(this.activeLayerId, {
        originalEvent: new PointerEvent('pointerleave', e),
        ...point,
      });
      this.eventManager.dispatchEvent(this.activeLayerId, {
        originalEvent: new MouseEvent('mouseleave', e),
        ...point,
      });
    }

    this.activeLayerId = layerId;

    if (e instanceof MouseEvent) {
      this.eventManager.dispatchEvent(this.activeLayerId, {
        originalEvent: new PointerEvent('pointerenter', e),
        ...point,
      });
      this.eventManager.dispatchEvent(this.activeLayerId, {
        originalEvent: new MouseEvent('mouseenter', e),
        ...point,
      });
    }
  }

  /**
   * Handles events on canvas and then dispatch the event to the Layer component.
   */
  dispatchEvent(e: OriginalEvent) {
    if (!this.activeLayerId) return;
    const point = this.geometryManager.calculatePosition(e);
    this.eventManager.dispatchEvent(this.activeLayerId, { originalEvent: e, ...point });
  }

  drawBackgroundGrid(backgroundCanvas: HTMLCanvasElement) {
    const width = 10;
    const height = 10;
    const radius = 1;
    const scale = this.pixelRatio!;

    const context = backgroundCanvas.getContext('2d')!;
    const transform = context.getTransform();

    const canvas = new OffscreenCanvas(width, height);
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);

    const offscreenContext = canvas.getContext('2d')!;
    offscreenContext.beginPath();
    offscreenContext.fillStyle = COLORS.GRID;
    offscreenContext.arc(1, 1, radius, 0, 2 * Math.PI);
    offscreenContext.fill();

    const pattern = context.createPattern(canvas, 'repeat');
    if (!pattern) return;

    context.save();
    // TODO: replace "1" with scale
    context.setTransform(1, transform.b, transform.c, 1, transform.e, transform.f);

    context.fillStyle = pattern;
    context.fillRect(-transform.e / scale, -transform.f / scale, this.width!, this.height!);
    context.restore();
  }

  destroy() {
    cancelAnimationFrame(this.frame!);
  }
}
