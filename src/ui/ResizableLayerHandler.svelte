<script lang="ts">
  import Layer from './Layer.svelte';
  import { type RenderProps } from '../lib';

  export let x: number;
  export let y: number;
  export let active: boolean;

  $: render = ({ ctx }: RenderProps) => {
    if (!ctx) return;
    ctx.fillStyle = active ? '#111' : '#444';
    ctx.fillRect(x - 6, y - 6, 12, 12);
  };
</script>

<Layer {render} on:mouseenter on:mouseleave on:mousedown on:mouseup on:touchstart on:touchend />
