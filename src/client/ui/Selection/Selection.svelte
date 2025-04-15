<script lang="ts">
  import type { Point } from 'core/interfaces';
  import { geometryManager, type RenderProps } from 'core/services';
  import { Layer } from 'core/ui';

  import { COLORS } from 'client/shared/constants';

  interface Props {
    path: Point[];
  }

  let { path }: Props = $props();

  let _render = $derived(({ ctx, renderer }: RenderProps) => {
    if (!ctx) return;

    const rect = geometryManager.getRectDimensionFromPath(path);
    if (!rect) return;

    ctx.globalAlpha = 0.9;
    renderer.strokeRect({ ...rect, color: COLORS.SELECTION, lineWidth: 2 });
    renderer.fillRect({ ...rect, color: '#35b2dc33' });
    ctx.globalAlpha = 1;
  });
</script>

<Layer render={_render} />
