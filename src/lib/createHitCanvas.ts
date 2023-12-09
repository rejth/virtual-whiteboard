import type { HitCanvasRenderingContext2D, LayerId, RGB } from '.';

// https://blog.logrocket.com/guide-javascript-bitwise-operators/#sign-propagating-right-shift
function convertRGBtoLayerId([red, green, blue]: RGB): number {
  const id = ((red << 16) | (green << 8) | blue) / 2;
  return id % 1 ? 0 : id;
}

function convertLayerIdToRGB(id: number): RGB {
  const id2 = id * 2;
  const red = (id2 >> 16) & 0xff;
  const green = (id2 >> 8) & 0xff;
  const blue = id2 & 0xff;
  return [red, green, blue];
}

const options: CanvasRenderingContext2DSettings = {
  willReadFrequently: true,
};

const EXCLUDED_SETTERS: Array<keyof HitCanvasRenderingContext2D> = ['globalAlpha'];

export function createHitCanvas(canvas: HTMLCanvasElement) {
  let activeLayerId: LayerId;

  const hitCanvas = new OffscreenCanvas(canvas.width, canvas.height);
  const hitContext = hitCanvas.getContext('2d', options) as unknown as HitCanvasRenderingContext2D;
  const canvasContext = canvas.getContext('2d');

  const hitCanvasObserver = new MutationObserver(() => {
    hitCanvas.width = canvas.width;
    hitCanvas.height = canvas.height;
  });

  hitCanvasObserver.observe(canvas, { attributeFilter: ['width', 'height'] });

  return new Proxy(canvasContext as unknown as HitCanvasRenderingContext2D, {
    get(target, property: keyof HitCanvasRenderingContext2D) {
      if (property === 'getLayerId') {
        return (x: number, y: number) => {
          const [r, g, b] = hitContext.getImageData(x, y, 1, 1).data;
          return convertRGBtoLayerId([r, g, b]);
        };
      }

      if (property === 'setActiveLayerId') {
        return (layerId: number) => {
          activeLayerId = layerId;
        };
      }

      const value = target[property];
      if (typeof value !== 'function') return value;

      return (...args: any[]) => {
        const [r, g, b] = convertLayerIdToRGB(activeLayerId);
        const layerColor = `rgb(${r},${g},${b})`;
        hitContext.fillStyle = layerColor;
        hitContext.strokeStyle = layerColor;

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
