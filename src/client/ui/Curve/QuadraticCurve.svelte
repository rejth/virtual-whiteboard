<script lang="ts">
  import type { Point } from 'core/interfaces';
  import { type LayerEventHandlers, type RenderProps } from 'core/services';
  import { Layer } from 'core/ui';

  import { COLORS } from 'client/shared/constants';

  interface Props {
    start: Point;
    control: Point;
    end: Point;
    active?: boolean;
  }

  let {
    start,
    control,
    end,
    active = false,
    ...eventHandlers
  }: Props & LayerEventHandlers = $props();

  let render = $derived(({ renderer }: RenderProps) => {
    renderer.strokeQuadraticCurve({
      start,
      control,
      end,
      lineWidth: 3,
      color: active ? COLORS.SELECTION : '#000',
    });
  });
</script>

<Layer {render} {...eventHandlers} />
