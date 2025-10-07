<script lang="ts">
  import { onMount } from "svelte";
  import CodeBubbles from "./CodeBubbles.svelte";
  import ScenarioOverview from "./ScenarioOverview.svelte";
  import type { tScenarioData } from "./types";
  import ScenarioCodes from "./ScenarioCodes.svelte";

  let selected_scenario: tScenarioData | undefined = $state(undefined);
  $effect(() => {
    console.log("Linking selected_scenario changed", selected_scenario);
  });
  onMount(() => {});
</script>

<div class="page-container flex grow">
  <!-- <CodeBubbles {codes} /> -->
  <div class="flex-1 flex flex-col">
    <ScenarioOverview bind:selected_scenario />
  </div>
  <div class="bubble-container flex-1 flex flex-col">
    <ScenarioCodes {selected_scenario} />
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .page-container {
    padding: 2rem;
    text-align: center;
  }

  h1 {
    color: #646cff;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
  .bubble-container {
    outline: 1px solid var(--brand-primary);
    border-radius: 0.5rem;
  }
</style>
