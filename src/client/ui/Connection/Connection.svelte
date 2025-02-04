<script lang="ts">
  import { getBoxToBoxArrow, type ArrowOptions } from 'perfect-arrows';

  import type { Point, RectDimension } from 'core/interfaces';
  import { Layer } from 'core/ui';

  import { type CurveLayerEventDetails } from 'client/ui/Curve/interfaces';
  import { COLORS } from 'client/shared/constants';
  import QuadraticCurve from 'client/ui/Curve/QuadraticCurve.svelte';
  import ControlPoints from 'client/ui/Curve/ControlPoints.svelte';
  import { toolbarStore } from 'client/ui/Toolbar/store';

  import { connectionStore, type ConnectedBox } from './store';

  type Box = RectDimension | undefined;

  interface Props {
    connectionId?: string | null;
    source?: ConnectedBox | null;
    target?: ConnectedBox | null;
    selectOnMakingConnection?: boolean;
  }

  let {
    connectionId = null,
    source = null,
    target = null,
    selectOnMakingConnection = false,
  }: Props = $props();

  const arrowOptions: ArrowOptions = {
    bow: 0.1,
    stretch: 0.5,
    stretchMin: 0,
    stretchMax: 360,
    padStart: 0,
    padEnd: 11,
    flip: false,
    straights: true,
  };

  const endArrowRadius = 6;
  const t = 0.5;

  let active: boolean = $state(false);
  let isMoving: boolean = $state(false);
  let controlPoint: Point = $state({ x: 0, y: 0 });

  const getBoxToBoxConnection = (source: Box, target: Box): number[] => {
    if (!source || !target) return [];
    return getBoxToBoxArrow(
      source.x,
      source.y,
      source.width,
      source.height,
      target.x,
      target.y,
      target.width,
      target.height,
      arrowOptions,
    );
  };

  let [sx, sy, cx, cy, ex, ey, _ae, _as, _ac] = $derived(
    getBoxToBoxConnection(source?.box, target?.box),
  );

  $effect(() => {
    controlPoint = { x: cx, y: cy };
  });

  const controlPointEffect = $derived.by(() => {
    if (isMoving) {
      let midX = (sx + ex) / 2;
      let midY = (sy + ey) / 2;
      return {
        x: 2 * controlPoint.x - midX,
        y: 2 * controlPoint.y - midY,
      };
    } else {
      return controlPoint;
    }
  });

  let arrowAngle = $derived(Math.atan2(ey - controlPointEffect.y, ex - controlPointEffect.x));

  let curvePoint = $derived({
    x: Math.pow(1 - t, 2) * sx + 2 * (1 - t) * t * controlPointEffect.x + Math.pow(t, 2) * ex,
    y: Math.pow(1 - t, 2) * sy + 2 * (1 - t) * t * controlPointEffect.y + Math.pow(t, 2) * ey,
  });

  const handleCurvePointMove = (details: CurveLayerEventDetails) => {
    if (!details || selectOnMakingConnection) return;
    isMoving = true;
    controlPoint = details.point;
  };

  const handleConnectionActive = () => {
    if (!connectionId || selectOnMakingConnection) return;
    active = true;
    toolbarStore.changeTool(null);
    connectionStore.selectConnection(connectionId, { source: source!, target: target! });
  };

  const handleConnectionLeave = () => {
    if (!connectionId || selectOnMakingConnection) return;
    active = false;
    isMoving = false;
    connectionStore.deselectConnection(connectionId);
  };
</script>

<!--Start Point-->
<Layer
  render={({ renderer }) => {
    renderer.fillCircle({
      x: sx,
      y: sy,
      radius: 5,
      color: active && !selectOnMakingConnection ? COLORS.SELECTION : '#000',
    });
  }}
/>

<!--Control Points and Curve-->
<ControlPoints
  controlPoints={[curvePoint]}
  {selectOnMakingConnection}
  onpointmove={handleCurvePointMove}
  onpointtouch={handleConnectionActive}
  onpointleave={handleConnectionLeave}
>
  <QuadraticCurve
    {active}
    start={{ x: sx, y: sy }}
    control={controlPointEffect}
    end={{ x: ex, y: ey }}
  />
</ControlPoints>

<!--Arrow-->
<Layer
  render={({ ctx }) => {
    if (!ctx) return;
    ctx.save();
    ctx.translate(ex + Math.cos(arrowAngle) * 12, ey + Math.sin(arrowAngle) * 12);
    ctx.rotate(arrowAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-endArrowRadius * 2, -endArrowRadius);
    ctx.lineTo(-endArrowRadius * 2, endArrowRadius);
    ctx.closePath();
    ctx.fillStyle = active && !selectOnMakingConnection ? COLORS.SELECTION : '#000';
    ctx.fill();
    ctx.restore();
  }}
/>
