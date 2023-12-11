import type { HitCanvasRenderingContext2D, LayerId, RGB } from '.';

// https://blog.logrocket.com/guide-javascript-bitwise-operators/#sign-propagating-right-shift
function convertRGBtoLayerId([r, g, b]: RGB): number {
  const id = ((r << 16) | (g << 8) | b) / 2;
  return id % 1 ? 0 : id;
}

function convertLayerIdToRGB(id: number): RGB {
  const id2 = id * 2;
  const r = (id2 >> 16) & 0xff;
  const g = (id2 >> 8) & 0xff;
  const b = id2 & 0xff;
  return [r, g, b];
}

const options: CanvasRenderingContext2DSettings = {
  willReadFrequently: true,
};

const EXCLUDED_SETTERS: Array<keyof HitCanvasRenderingContext2D> = ['globalAlpha'];

export function createHitCanvas(
  canvas: HTMLCanvasElement,
  hitCanvas: OffscreenCanvas,
): HitCanvasRenderingContext2D {
  const hitContext = hitCanvas.getContext('2d', options) as unknown as HitCanvasRenderingContext2D;
  const canvasContext = canvas.getContext('2d');

  let activeLayerId: LayerId;

  const setActiveLayerId = (layerId: number) => {
    activeLayerId = layerId;
  };

  const getLayerIdFromUnderlyingPixel = (x: number, y: number) => {
    const [r, g, b] = hitContext.getImageData(x, y, 1, 1).data;
    return convertRGBtoLayerId([r, g, b]);
  };

  const drawLayerOnHitCanvas = () => {
    const [r, g, b] = convertLayerIdToRGB(activeLayerId);
    const layerColor = `rgb(${r},${g},${b})`;
    hitContext.fillStyle = layerColor;
    hitContext.strokeStyle = layerColor;
  };

  return new Proxy(canvasContext as unknown as HitCanvasRenderingContext2D, {
    get(target, property: keyof HitCanvasRenderingContext2D) {
      if (property === 'getLayerIdAt') {
        return getLayerIdFromUnderlyingPixel;
      }
      if (property === 'setActiveLayerId') {
        return setActiveLayerId;
      }

      const value = target[property];
      if (typeof value !== 'function') return value;

      return (...args: any[]) => {
        drawLayerOnHitCanvas();
        (<Function>hitContext[property])(...args);

        return Reflect.apply(value, target, args);
      };
    },

    set(target, property: keyof HitCanvasRenderingContext2D, newValue) {
      (<HitCanvasRenderingContext2D>target[property]) = newValue;

      if (!EXCLUDED_SETTERS.includes(property)) {
        (<HitCanvasRenderingContext2D>hitContext[property]) = newValue;
      }

      return true;
    },
  });
}
