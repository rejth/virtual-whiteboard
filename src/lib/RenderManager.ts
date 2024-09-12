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
    this.drawBackgroundGrid();
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
      draw({ ctx: context });
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

  drawBackgroundGrid() {
    if (!this.context) return;

    const pixelRatio = this.pixelRatio!;
    const width = 10;
    const height = 10;
    const radius = 1;
    const transform = this.context.getTransform();

    const offscreenCanvas = new OffscreenCanvas(width, height);
    offscreenCanvas.width = Math.floor(width * pixelRatio);
    offscreenCanvas.height = Math.floor(height * pixelRatio);

    const offscreenContext = offscreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    offscreenContext.beginPath();
    offscreenContext.fillStyle = COLORS.GRID;
    offscreenContext.arc(1, 1, radius, 0, 2 * Math.PI);
    offscreenContext.fill();

    const pattern = this.context.createPattern(offscreenCanvas, 'repeat');
    if (!pattern) return;

    this.context.save();

    // this.context.setTransform(
    //   pixelRatio,
    //   transform.b,
    //   transform.c,
    //   pixelRatio,
    //   transform.e,
    //   transform.f,
    // );

    this.context.fillStyle = pattern;
    this.context.fillRect(
      -transform.e / pixelRatio,
      -transform.f / pixelRatio,
      this.width!,
      this.height!,
    );

    this.context.restore();
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
