import { onDestroy, setContext, untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

import {
  REGISTER_LAYER_KEY,
  Renderer,
  SUPPORTED_EVENTS,
  geometryManager,
  warn,
} from 'core/services';
import type {
  CanvasContext,
  CanvasConfig,
  Render,
  LayerEventHandler,
  LayerEventHandlers,
  CanvasEventHandler,
  LayerProps,
  CanvasEventHandlers,
  HitCanvasRenderingContext2D,
  LayerId,
} from './types';

export class LayerManager {
  #renderer: Renderer;
  #renderers: Map<LayerId, Render> = new SvelteMap();
  #eventHandlers: Map<LayerId, LayerEventHandlers> = new SvelteMap();

  #currentLayerId: LayerId = 1;
  #startTime: number = Date.now();
  #frame: number = $state(0);

  #context?: CanvasContext;

  #config: CanvasConfig;

  #autoplayLoop?: number;

  #layerObserver?: MutationObserver;
  #layerSequence: LayerId[] = $state([]);

  #activeLayerId: LayerId = $state(0);
  #activeLayerEventHandlers? = $derived(this.#eventHandlers.get(this.#activeLayerId));

  constructor(renderer: Renderer, config: CanvasConfig) {
    this.#config = config;
    this.#renderer = renderer;
    setContext(REGISTER_LAYER_KEY, this.registerLayer.bind(this));
  }

  init(context: CanvasContext, layerRef: HTMLElement) {
    this.#context = context;
    this.#observeLayerSequence(layerRef);

    $effect(() => this.#autoplay());
    $effect(() => this.#handleResize());
    $effect(() => (this.#frame, this.#render()));

    onDestroy(() => this.#destroy());
  }

  /**
   * Forces canvas's transformation matrix adjustment to scale drawings according to the new width, height or device's pixel ratio.
   */
  redraw() {
    this.#frame++;
  }

  registerLayer({ render, ...eventHandlers }: LayerProps) {
    const layerId = this.#getLayerId();

    this.#renderers.set(layerId, render);

    if (Object.keys(eventHandlers).length) {
      if (this.#config.layerEvents) {
        this.#eventHandlers.set(layerId, eventHandlers);
      } else {
        warn('Canvas must have layerEvents={true} in order to use layer-level event handlers');
      }
    }

    onDestroy(() => this.#unregister(layerId));

    return layerId;
  }

  getContext(): CanvasContext | null {
    return this.#renderer.getContext();
  }

  getRenderer(): Renderer {
    return this.#renderer;
  }

  #getLayerId() {
    return this.#currentLayerId++;
  }

  #unregister(layerId: number) {
    this.#renderers.delete(layerId);
    this.#eventHandlers.delete(layerId);
  }

  #handleResize() {
    const { width, height, pixelRatio, onresize } = this.#config;
    onresize?.({ width, height, pixelRatio });
  }

  #observeLayerSequence(layerRef: HTMLElement) {
    const getLayerSequence = () => {
      const layers = <HTMLElement[]>[...layerRef.children];
      this.#layerSequence = layers.map((layer) => +layer.dataset.layerId!);
    };

    this.#layerObserver = new MutationObserver(() => getLayerSequence());
    this.#layerObserver.observe(layerRef, { childList: true });
    getLayerSequence();
  }

  #autoplay() {
    if (this.#config.autoplay) {
      untrack(() => this.redraw());
      this.#autoplayLoop = requestAnimationFrame(() => this.#autoplay());
    } else {
      cancelAnimationFrame(this.#autoplayLoop!);
    }
  }

  /**
   * The main render function which is responsible for rendering, clearing and canvas's transformation matrix adjustment.
   * Renders the canvas only when width, height or pixelRatio change.
   * */
  #render() {
    const ctx = <CanvasRenderingContext2D>this.#context;
    const { width, height, autoclear } = this.#config;

    const time = Date.now() - this.#startTime;
    const renderProps = { ctx, width, height, time, renderer: this.#renderer };
    const transformedArea = this.#renderer.getTransformedArea();

    if (autoclear && transformedArea) {
      this.#renderer.clearRectSync(transformedArea);
    }

    for (const layerId of this.#layerSequence) {
      (<HitCanvasRenderingContext2D>this.#context).setActiveLayerId?.(layerId);
      this.#renderers.get(layerId)?.(renderProps);
    }
  }

  #handleCanvasEvent(e: MouseEvent | TouchEvent) {
    const type = <CanvasEventHandler>`on${e.type}`;
    const eventHandler = this.#config.handlers[type];
    eventHandler?.(e);
  }

  #handleLayerEvent(e: MouseEvent | TouchEvent, handleEventsOnLayerMove: boolean) {
    const { pixelRatio } = this.#config;
    const { x, y } = geometryManager.calculatePosition(e);
    const allowedEvents = ['touchstart'];

    if (handleEventsOnLayerMove) {
      allowedEvents.push('pointermove');
    } else {
      allowedEvents.push('mousedown');
    }

    if (allowedEvents.includes(e.type)) {
      const layerId = (<HitCanvasRenderingContext2D>this.#context).getLayerIdAt(
        x * pixelRatio,
        y * pixelRatio,
      );

      if (this.#activeLayerId !== layerId) {
        this.#dispatchLayerEvent(e, 'leave');
        this.#activeLayerId = layerId;
        this.#dispatchLayerEvent(e, 'enter');
      }
    }

    if (!this.#activeLayerEventHandlers) return;

    const type = <LayerEventHandler>`on${e.type.replace('layer.', '')}`;
    const eventHandler = this.#activeLayerEventHandlers[type];
    eventHandler?.({ x, y, originalEvent: e });
  }

  #dispatchLayerEvent = (e: MouseEvent | TouchEvent, type: 'enter' | 'leave') => {
    if (!(e instanceof MouseEvent)) return;
    e.target?.dispatchEvent(new PointerEvent(`layer.pointer${type}`, e));
    e.target?.dispatchEvent(new MouseEvent(`layer.mouse${type}`, e));
  };

  createEventHandlers(handleEventsOnLayerMove: boolean) {
    const handleEvent = (e: MouseEvent | TouchEvent) => {
      this.#handleCanvasEvent(e);
      if (this.#config.layerEvents) {
        this.#handleLayerEvent(e, handleEventsOnLayerMove);
      }
    };

    return SUPPORTED_EVENTS.reduce<CanvasEventHandlers>(
      (eventHandlers, eventType) => ({ ...eventHandlers, [eventType]: handleEvent }),
      {},
    );
  }

  #destroy() {
    if (typeof window === 'undefined') return;

    this.#layerObserver?.disconnect();
    cancelAnimationFrame(this.#autoplayLoop!);
  }
}
