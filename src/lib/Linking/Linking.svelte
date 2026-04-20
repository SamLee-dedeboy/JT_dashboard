<script lang="ts">
  import { onMount } from "svelte";
  import CodeBubbles from "./CodeBubbles.svelte";
  import ScenarioOverview from "./ScenarioOverview.svelte";
  import type { tScenarioData } from "./types";
  import ScenarioCodes from "./ScenarioCodes.svelte";

  let selected_scenario: tScenarioData | undefined = $state(undefined);
  let tutorial_open = $state(true);
  $effect(() => {
    console.log("Linking selected_scenario changed", selected_scenario);
  });
  onMount(() => {});
</script>

<div class="page-container px-2 pb-2 flex grow relative">
  <button
    type="button"
    class="tutorial-trigger absolute top-[-3rem] left-2 flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium"
    onclick={() => (tutorial_open = true)}
  >
    <span aria-hidden="true">?</span>
    Tutorial
  </button>
  <!-- <CodeBubbles {codes} /> -->
  <div class="flex flex-col w-[60%]">
    <ScenarioOverview bind:selected_scenario />
  </div>
  <div class="bubble-container flex flex-col w-[40%]">
    <ScenarioCodes {selected_scenario} />
  </div>
</div>

{#if tutorial_open}
  <div
    class="tutorial-overlay fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="linking-tutorial-title"
  >
    <div
      class="tutorial-backdrop absolute inset-0"
      role="button"
      tabindex="-1"
      aria-label="Close tutorial"
      onclick={() => (tutorial_open = false)}
      onkeydown={(e) => {
        if (e.key === "Escape") tutorial_open = false;
      }}
    ></div>
    <div
      class="tutorial-modal relative z-10 flex max-h-[85vh] w-160 max-w-[90vw] flex-col gap-4 overflow-auto rounded-lg p-6 text-white shadow-xl"
    >
      <div class="flex items-start justify-between gap-4">
        <h2 id="linking-tutorial-title" class="text-lg font-semibold">
          How to use this interface
        </h2>
        <button
          type="button"
          class="tutorial-close rounded-md px-2 py-1 text-sm"
          aria-label="Close tutorial"
          onclick={() => (tutorial_open = false)}
        >
          ✕
        </button>
      </div>
      <div class="flex flex-col gap-3 text-left">
        <p>
          This page lets you explore public opinions associated with each
          scenario.
        </p>
        <p>Click a scenario to get started.</p>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  @reference "tailwindcss";
  .page-container {
    /* padding: 2rem; */
    text-align: center;
  }
  .tutorial-trigger {
    background-color: var(--brand-primary);
    color: white;
    cursor: pointer;
    transition: filter 0.15s;
  }
  .tutorial-trigger:hover {
    filter: brightness(1.1);
  }
  .tutorial-backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .tutorial-modal {
    background-color: var(--bg-page);
    outline: 2px solid var(--brand-primary);
  }
  .tutorial-close {
    background-color: transparent;
    color: white;
    cursor: pointer;
  }
  .tutorial-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
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
