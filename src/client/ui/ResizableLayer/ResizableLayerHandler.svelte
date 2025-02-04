<script lang="ts">
  import { geometryManager, type LayerEventHandlers, type RenderProps } from 'core/services';
  import { Layer } from 'core/ui';

  import { COLORS } from 'client/shared/constants';

  interface Props {
    x: number;
    y: number;
    active: boolean;
  }

  let { x, y, active, ...eventHandlers }: Props & LayerEventHandlers = $props();

  let bounds = $derived({ x0: x, y0: y, x1: x, y1: y });

  let render = $derived(({ renderer }: RenderProps) => {
    const rect = geometryManager.getRectDimensionFromBounds(bounds);
    renderer.fillCircle({
      x: rect.x,
      y: rect.y,
      radius: 5,
      color: active ? COLORS.STICKER_BLUE : COLORS.SELECTION,
    });
  });
</script>

<Layer {bounds} {render} {...eventHandlers} />
