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
    handleClick
  );
  let { codes, selected_code = $bindable() }: CodeGraphProps = $props();
  let mounted = $state(false);

  $effect(() => {
    if (mounted) {
      graph_renderer.update(codes);
    }
  });

  onMount(() => {
    graph_renderer.init();
    mounted = true;
    console.log({ codes });
  });

  function handleClick(node: GraphNode) {
    console.log("CodeGraph handleClick", node);
    selected_code = node;
  }
</script>

<div class="flex flex-col h-0 grow relative pb-2">
  <svg id={svgId} class="overflow-hidden mt-2 w-full h-full"></svg>
</div>

<style lang="postcss">
  @reference "tailwindcss";
</style>
