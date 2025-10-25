<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import type { tSummaryData } from "./types";
  import { CodeGraphRenderer } from "./renderers/CodeGraphRenderer";
  import { server_address } from "./constants";
  // import Tooltip from "./BubbleTooltip.svelte";
  import BubbleTooltip from "./BubbleTooltip.svelte";
  import { bubble_color } from "./constants";
  import type { tCode } from "./renderers/CodeGraphRenderer";
  import GraphNodeTooltip from "./GraphNodeTooltip.svelte";
  type CodeGraphProps = {
    codes: tCode[];
  };
  const svgId = "code_graph";
  let graph_renderer: CodeGraphRenderer = new CodeGraphRenderer(
    svgId,
    handleClick
  );
  let { codes }: CodeGraphProps = $props();
  let mounted = $state(false);
  let tooltip: any = $state();
  let selected_code: tCode | undefined = $state(undefined);

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

  function handleClick(node: tCode) {
    console.log("CodeGraph handleClick", node);
    selected_code = node;
  }

  function handleCloseTooltip() {
    selected_code = undefined;
  }

  // Handle keyboard events for modal
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && selected_code) {
      handleCloseTooltip();
    }
  }
</script>

<div class="flex flex-col h-0 grow relative pb-2">
  <svg id={svgId} class="overflow-hidden mt-2 w-full h-full"></svg>

  <!-- Modal backdrop and modal -->
  {#if selected_code}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute inset-0 flex items-center justify-center z-50"
      onclick={handleCloseTooltip}
      onkeydown={handleKeydown}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        bind:this={tooltip}
        class="modal rounded-lg shadow-xl max-w-4xl max-h-[80vh] w-full mx-4 flex flex-col outline-2 outline-[var(--brand-primary)]"
        onclick={(e) => e.stopPropagation()}
        role="document"
      >
        <GraphNodeTooltip code={selected_code} handleClose={handleCloseTooltip}
        ></GraphNodeTooltip>
      </div>
    </div>
  {/if}
</div>

<svelte:window onkeydown={handleKeydown} />

<style lang="postcss">
  @reference "tailwindcss";
  /* button {
    @apply max-w-[6rem] text-slate-700 outline outline-2 rounded px-2 py-1 flex flex-wrap gap-x-1 items-center justify-center hover:scale-110 transition-all duration-100;
  } */

  /* .canvas {

  } */
  .modal {
    background-color: color-mix(
      in srgb,
      var(--surface-interactive) 90%,
      transparent
    );
  }
</style>
