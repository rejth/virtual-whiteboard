import { COLORS, createHitCanvas, EventManager, GeometryManager } from './index';
import {
  type HitCanvasRenderingContext2D,
  type OriginalEvent,
  type Render,
  type LayerId,
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

  /**
   * Handles events on canvas to identify the corresponding layer and then dispatch the event to the Layer component.
   */
  handleEvent(e: OriginalEvent) {
    const { x, y } = this.geometryManager.calculatePosition(e);
    const layerId = this.context!.getLayerIdAt(x, y);
    this.eventManager.dispatchEvent(e, layerId, { x, y });
  }

  /**
   * Handles mouse "move" and pointer "enter" events on canvas to identify the corresponding layer and then dispatch the event to the Layer component.
   */
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
    context.setTransform(1, transform.b, transform.c, 1, transform.e, transform.f);

    context.fillStyle = pattern;
    context.fillRect(-transform.e / scale, -transform.f / scale, this.width!, this.height!);
    context.restore();
  }

  addDrawer(layerId: LayerId, render: Render) {
    this.drawers.set(layerId, render);
  }

  removeDrawer(layerId: LayerId) {
    this.drawers.delete(layerId);
  }

  destroy() {
    cancelAnimationFrame(this.frame!);
  }
}
