declare global {
  namespace App {}

  namespace svelteHTML {
    interface HTMLAttributes<T extends EventTarget> {
      'on:outclick'?: (e: CustomEvent) => void;
      'onlayer.mouseenter'?: MouseEventHandler<T> | undefined | null;
      'onlayer.mouseleave'?: MouseEventHandler<T> | undefined | null;
      'onlayer.pointerenter'?: PointerEventHandler<T> | undefined | null;
      'onlayer.pointerleave'?: PointerEventHandler<T> | undefined | null;
    }
  }
}

export {};
