<script lang="ts">
  import Layer from './Layer.svelte';
  import { type Point, type RenderProps } from '../lib';

  export let point: Point;
  export let active: boolean;

  $: render = ({ ctx }: RenderProps) => {
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = active ? 'red' : 'blue';
    ctx.fill();
  };
</script>

<Layer {render} on:mouseenter on:mouseleave on:mousedown on:mouseup on:touchstart on:touchend />
