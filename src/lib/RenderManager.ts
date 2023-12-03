import { GeometryManager, LayerManager, type OriginalEvent, type Render } from '.';

export class RenderManager {
  canvasRef: HTMLCanvasElement | null = null;

  hitCanvasRef: HTMLCanvasElement | null = null;

  ctx: CanvasRenderingContext2D | null = null;

  hitCtx: CanvasRenderingContext2D | null = null;

  drawers: Set<Render> = new Set();

  geometryManager: GeometryManager;

  layerManager: LayerManager;

  constructor() {
    this.geometryManager = new GeometryManager();
    this.layerManager = new LayerManager();
  }

  init(canvasRef: HTMLCanvasElement) {
    this.canvasRef = canvasRef;

    this.#createCanvas();
    this.#createHitCanvas();
  }

  #createCanvas() {
    if (!this.canvasRef) return;
    this.ctx = this.canvasRef.getContext('2d');
  }

  #createHitCanvas() {
    this.hitCanvasRef = document.createElement('canvas');
    this.hitCtx = this.hitCanvasRef.getContext('2d', { willReadFrequently: true });
  }

  addDrawer(render: Render) {
    this.drawers.add(render);
  }

  removeDrawer(render: Render) {
    this.drawers.delete(render);
  }

  render() {
    if (!this.ctx || !this.hitCtx) return;
    this.drawers.forEach((draw: Render) => draw({ ctx: this.ctx }));
    this.drawers.forEach((draw: Render) => draw({ ctx: this.hitCtx }));
  }

  clearRect(width: number, height: number) {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, width, height);
  }

  handleEvent(e: OriginalEvent) {
    if (!this.hitCtx) return;

    const { x, y } = this.geometryManager.calculatePosition(e);
    const pixel = this.hitCtx.getImageData(x, y, 1, 1).data;
    console.log('pixel data: ', pixel);

    /**
     * TODO:
     * const shape = colorCache[color]
     * if (shape) this.layerManager.dispatchEvent(e, { x, y })
     */

    this.layerManager.dispatchEvent(e, { x, y });
  }
}
