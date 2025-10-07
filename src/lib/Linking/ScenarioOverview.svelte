<script lang="ts">
  import { onMount } from "svelte";
  import { server_address } from "./constants";
  import { slide } from "svelte/transition";
  import type { tScenarioData } from "./types";
  let {
    selected_scenario = $bindable(),
  }: {
    selected_scenario: tScenarioData | undefined;
  } = $props();
  let scenario_overview: tScenarioData[] | undefined = $state(undefined);

  function fetchScenarioOverview() {
    fetch(server_address + "/scenarios/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Scenario Overview:", data);
        scenario_overview = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  onMount(() => {
    fetchScenarioOverview();
  });
</script>

{#if !scenario_overview}
  <div class="loading">Loading...</div>
{:else}
  <div class="scenario-container flex flex-col flex-1 gap-y-2">
    <div class="flex flex-col flex-1 gap-y-2">
      <div class="flex flex-col py-1 grow gap-y-2">
        <div class="selector flex flex-col gap-y-4 z-10">
          <div class="scenario-label italic">Scenarios:</div>
          <div class="flex gap-x-4 gap-y-2 flex-wrap mx-1">
            {#each scenario_overview as scenario}
              <button
                class="scenario-button w-fit min-h-[4rem] text-sm italic outline outline-2 rounded px-2 py-0.5 font-sans uppercase transition-all"
                class:active={selected_scenario?.name === scenario.name}
                onclick={() =>
                  (selected_scenario = scenario_overview?.find(
                    (s) => s.name === scenario.name
                  ))}
              >
                {scenario.name}
              </button>
            {/each}
          </div>
        </div>
        <div class="content-area flex flex-col grow">
          <div
            class="content-container px-2 flex flex-col grow divide-y rounded"
          >
            {#if selected_scenario}
              {#key selected_scenario.name}
                <div in:slide class="p-1 rounded grow">add an image here</div>
                <div in:slide class="p-1 rounded">
                  <span class="field-label italic text-sm">
                    Description -
                  </span>
                  <span class="field-content">
                    {selected_scenario.narrative}
                  </span>
                </div>
                <div class="mt-2 px-1 rounded">
                  <span class="field-label italic text-sm">
                    Primary Research Importance
                  </span>
                  <div class="field-content">
                    {selected_scenario.primary_research_importance}
                  </div>
                </div>
                <div class="mt-2 px-1 rounded">
                  <span class="field-label italic text-sm"> Adaptation </span>
                  <div class="field-content">
                    {selected_scenario.adaptation}
                  </div>
                </div>
                <div class="mt-2 px-1 rounded">
                  <span class="field-label italic text-sm"> Key Drivers </span>
                  <div class="field-content">
                    {selected_scenario.key_drivers}
                  </div>
                </div>
                <div class="min-h-[10rem]"></div>
              {/key}
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  @reference "tailwindcss";

  .loading {
    color: var(--text-secondary);
  }

  .scenario-label {
    color: var(--text-secondary);
  }

  .scenario-button {
    /* background-color: var(--neutral-100); */
    color: var(--text-primary);
    outline-color: var(--neutral-500);
  }

  /* .scenario-button:hover {
    background-color: var(--neutral-200);
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
  } */

  .active {
    background-color: var(--brand-primary);
    outline-color: var(--brand-primary);
    font-weight: 600;
    color: var(--neutral-800);
  }

  .content-area {
    /* background-color: var(--neutral-100); */
  }

  .content-container {
    color: var(--text-primary);
  }

  .field-label {
    color: var(--text-secondary);
  }

  .field-content {
    /* color: var(--neutral-800); */
    color: var(--text-primary);
  }
</style>
