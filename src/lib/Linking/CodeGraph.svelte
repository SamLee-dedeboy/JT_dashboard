<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import type { tSummaryData } from "./types";
  import { CodeGraphRenderer } from "./renderers/CodeGraphRenderer";
  import { server_address } from "./constants";
  // import Tooltip from "./BubbleTooltip.svelte";
  import BubbleTooltip from "./BubbleTooltip.svelte";
  import { bubble_color } from "./constants";
  import type { tCode, GraphNode } from "./renderers/CodeGraphRenderer";
  type CodeGraphProps = {
    codes: tCode[];
    selected_code?: GraphNode | undefined;
  };
  const svgId = "code_graph";
  let graph_renderer: CodeGraphRenderer = new CodeGraphRenderer(
    svgId,
    handleHover,
  );
  let { codes, selected_code = $bindable() }: CodeGraphProps = $props();
  let mounted = $state(false);
  let zoom_level = $state(0.6);

  $effect(() => {
    if (mounted) {
      graph_renderer.update(codes);
    }
  });

  onMount(() => {
    graph_renderer.onZoomChange = (scale) => {
      zoom_level = scale;
    };
    graph_renderer.init();
    mounted = true;
    console.log({ codes });
  });

  function handleHover(node: GraphNode | null) {
    selected_code = node ?? undefined;
  }
</script>

<div class="flex flex-col h-0 grow relative pb-2">
  <svg id={svgId} class="overflow-hidden mt-2 w-full h-full"></svg>
  <div
    class="zoom-controls absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-md px-1.5 py-1 shadow-md"
  >
    <button
      type="button"
      class="zoom-btn"
      aria-label="Zoom out"
      onclick={() => graph_renderer.zoomOut()}
    >
      −
    </button>
    <button
      type="button"
      class="zoom-btn reset"
      aria-label="Reset zoom"
      onclick={() => graph_renderer.resetZoom()}
    >
      Reset
    </button>
    <div class="zoom-level" aria-live="polite">
      {Math.round(zoom_level * 100)}%
    </div>
    <button
      type="button"
      class="zoom-btn"
      aria-label="Zoom in"
      onclick={() => graph_renderer.zoomIn()}
    >
      +
    </button>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .zoom-controls {
    background-color: color-mix(
      in srgb,
      var(--surface-elevated) 85%,
      transparent
    );
    outline: 1px solid var(--border-subtle);
    z-index: 5;
  }
  .zoom-btn {
    min-width: 2rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 1rem;
    line-height: 1;
    color: var(--text-primary);
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.15s;
  }
  .zoom-btn.reset {
    font-size: 0.8rem;
  }
  .zoom-btn:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  .zoom-level {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 3rem;
    padding: 0 0.4rem;
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
  }
</style>
