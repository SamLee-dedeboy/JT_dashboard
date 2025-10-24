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

<div class="page-container flex grow relative">
  <div class="tutorial absolute top-[-1.5rem] max-w-[35rem] left-1/5">
    <div class="text-left text-white mt-2 px-3 pb-1">
      <p class="">
        This page lets you explore public opinions associated with each
        scenario.
      </p>
      <p>Click a scenario to get started.</p>
    </div>
  </div>
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
  .tutorial {
    background-color: var(--bg-page);
    outline: 2px solid var(--brand-primary);
    border-radius: 4px;
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
    outline: 1px solid var(--jt-secondary);
    border-radius: 0.5rem;
  }
</style>
