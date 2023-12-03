<script lang="ts">
  import Layer from './Layer.svelte';
  import { type Point, type Context, KEY } from '../lib';

  export let x: number;
  export let y: number
  export let active: boolean;
  
  $: render = ({ ctx }) => {
    ctx.fillStyle = active ? '#111' : '#444';
    ctx.fillRect(x - 6, y - 6, 12, 12);
  };

  const handleEvent = (e: LayerEventDetails) => {
    console.log('event on Handler: ', e)
  }
</script>

<Layer
  {render}
  on:mouseenter
  on:mouseleave
  on:mousedown={handleEvent}
  on:mouseup
  on:touchstart
  on:touchend
/>
