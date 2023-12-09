import {
  createHitCanvas,
  LayerManager,
  type HitCanvasRenderingContext2D,
  type OriginalEvent,
  type Render,
  type Point,
  type LayerId,
} from '.';

export class RenderManager {
  ctx: HitCanvasRenderingContext2D | null = null;

  drawers: Map<LayerId, Render> = new Map();

  layerManager: LayerManager;

  constructor() {
    this.layerManager = new LayerManager();
  }

  init(canvasRef: HTMLCanvasElement) {
    this.ctx = createHitCanvas(canvasRef);
  }

  addDrawer(layerId: LayerId, render: Render) {
    this.drawers.set(layerId, render);
  }

  removeDrawer(layerId: LayerId) {
    this.drawers.delete(layerId);
  }

  render() {
    this.drawers.forEach((draw, layerId) => {
      this.ctx!.setActiveLayerId(layerId);
      draw({ ctx: this.ctx! });
    });
  }

  clearRect(width: number, height: number) {
    this.ctx!.clearRect(0, 0, width, height);
  }

  handleEvent(e: OriginalEvent, { x, y }: Point) {
    const activeLayerId = this.ctx!.getLayerId(x, y);
    this.layerManager.dispatchEvent(e, activeLayerId, { x, y });
  }
}
