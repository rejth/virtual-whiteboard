<script lang="ts">
  import { Spring, Tween } from 'svelte/motion';
  import { quadInOut as easing } from 'svelte/easing';

  import type { CanvasContext, RenderProps } from 'core/services';
  import { Layer } from 'core/ui';

  import { position, activeLayer, type Render } from './store';

  interface Props {
    name: string;
    render: Render;
  }

  let { name, render }: Props = $props();

  const id = Symbol();
  let active = $derived($activeLayer?.id === id);
  let inactive = $derived($activeLayer?.id && !active);
  let point = $derived($position);

  const styleTween = (initial: number) => {
    const tween = new Tween(initial, { duration: 250, easing });
    return {
      value: tween.current,
      set: (value: number) => tween.set(value, { delay: Math.random() * 50 + 10 }),
    };
  };

  const blur = styleTween(0);
  const saturation = styleTween(1);
  const opacity = styleTween(1);
  const scale = new Spring(1, { stiffness: 0.1, damping: 0.2 });

  $effect(() => {
    blur.set(inactive ? 0.018 : 0);
  });
  $effect(() => {
    saturation.set(inactive ? 0.4 : 1);
  });
  $effect(() => {
    opacity.set(inactive ? 0.5 : 1);
  });
  $effect(() => {
    scale.set(!$activeLayer?.id ? 1 : (!active ? 0.95 : 1.1) + Math.random() / 10);
  });

  let styleActive = $derived((ctx: CanvasContext) => () => {
    if (active) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#dcdcdc';
      ctx.lineWidth = 2;
    }
    return active;
  });

  let _render = $derived(({ ctx, renderer }: RenderProps) => {
    const { width, height } = renderer.getCanvasOptions();

    ctx.save();

    ctx.translate(point.x, point.y);
    ctx.scale(scale.current, scale.current);
    ctx.translate(-point.x, -point.y);
    ctx.globalAlpha = opacity.value;
    ctx.filter = `blur(${width * blur.value}px) saturate(${saturation.value * 100}%)`;
    render({ ctx, renderer, width, height, active: styleActive(ctx) });

    ctx.restore();
  });
</script>

<Layer
  render={_render}
  onpointerenter={() => ($activeLayer = { name, id })}
  ontouchstart={() => ($activeLayer = { name, id })}
  onpointerleave={() => ($activeLayer = null)}
  ontouchend={() => ($activeLayer = null)}
  onpointerdown={() => scale.set(0.95)}
  onpointerup={() => scale.set(1.1)}
/>
