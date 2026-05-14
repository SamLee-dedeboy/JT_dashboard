<script lang="ts">
  import { onMount } from "svelte";
  import CodeBubbles from "./CodeBubbles.svelte";
  import ScenarioOverview from "./ScenarioOverview.svelte";
  import type { tScenarioData } from "./types";
  import type { GraphNode } from "./renderers/CodeGraphRenderer";
  import ScenarioCodes from "./ScenarioCodes.svelte";

  let selected_scenario: tScenarioData | undefined = $state(undefined);
  let selected_code: GraphNode | undefined = $state(undefined);
  $effect(() => {
    console.log("Linking selected_scenario changed", selected_scenario);
    selected_code = undefined;
  });
  onMount(() => {});
</script>

<div class="page-container flex grow relative">
  <!-- <CodeBubbles {codes} /> -->
  <div class="flex-1 flex flex-col min-h-0 relative">
    <ScenarioOverview bind:selected_scenario bind:selected_code />
  </div>
  <div class="flex flex-col flex-1 gap-4">
    <h3>PUBLIC IDEAS & VALUES</h3>
    <div class="bubble-container flex flex-col flex-1 min-h-0">
      <ScenarioCodes {selected_scenario} bind:selected_code />
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .page-container {
    /* padding: 2rem; */
    padding: 0.5rem 2rem 2rem;
    text-align: center;
  }

  h1 {
    color: #646cff;
    margin-bottom: 1rem;
  }

  /* p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  } */
  .bubble-container {
    outline: 1px solid var(--surface-page);
    border-radius: 0.1rem;
    background: var(--surface-page);
  }
</style>
