<script lang="ts">
  import type { Point } from 'core/interfaces';
  import { type LayerEventHandlers, type RenderProps } from 'core/services';
  import { Layer } from 'core/ui';

  import { COLORS } from 'client/shared/constants';

  interface Props {
    point: Point;
    active?: boolean;
  }

  let { point, active = false, ...eventHandlers }: Props & LayerEventHandlers = $props();

  let render = $derived(({ renderer }: RenderProps) => {
    renderer.fillCircle({
      ...point,
      radius: 5,
      color: active ? COLORS.SELECTION : '#000',
    });
  });
</script>

<Layer {render} {...eventHandlers} />
