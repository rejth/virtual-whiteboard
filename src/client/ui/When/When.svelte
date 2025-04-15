<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    isVisible: boolean;
    children?: Snippet;
  }

  let { isVisible, children }: Props = $props();
</script>

{#if isVisible}
  {@render children?.()}
{/if}
