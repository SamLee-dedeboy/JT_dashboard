<script lang="ts">
  import { onMount } from "svelte";
  import { server_address } from "./constants";
  import { slide, scale } from "svelte/transition";
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
          <div class="scenario-label italic text-left pl-1">Scenarios:</div>
          <div class="flex gap-x-4 gap-y-4 flex-wrap mx-1">
            {#each scenario_overview as scenario}
              <button
                class="scenario-button w-fit min-h-[4rem] text-lg italic outline outline-2 rounded px-4 py-2 uppercase transition-all"
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
            class="content-container px-2 flex flex-col items-center justify-center grow rounded relative"
          >
            {#if selected_scenario}
              {#key selected_scenario.name}
                <div class="p-1 absolute left-0 right-0 top-0 bottom-0">
                  <img
                    src={`scenario_imagery/${selected_scenario.name}.jpg`}
                    alt="Scenario Image"
                    class="w-full h-full object-contain"
                  />
                </div>
                <div
                  class="scenario-content flex p-2 flex-col max-w-[45rem] self-center relative mt-4 shadow-[0_1px_6px_rgb(81,162,189,0.5)]"
                  in:slide
                >
                  <div class="p-1 text-left">
                    <!-- <span class="field-label"> Description - </span> -->
                    <span class="field-content">
                      {selected_scenario.narrative}
                    </span>
                  </div>
                  <div class="mt-2 px-1 text-left">
                    <span class="field-label">
                      Why is this scenario important?
                    </span>
                    <div class="field-content">
                      - {selected_scenario.primary_research_importance}
                    </div>
                  </div>
                  <div class="mt-2 px-1 text-left">
                    <span class="field-label"> Adaptation </span>
                    <div class="field-content">
                      - {selected_scenario.adaptation}
                    </div>
                  </div>
                  <div class="mt-2 px-1 text-left">
                    <span class="field-label"> Key Drivers </span>
                    <div class="field-content">
                      - {selected_scenario.key_drivers}
                    </div>
                  </div>
                  <div class="mt-2 px-1 text-left">
                    <span class="field-label"> Key Questions </span>
                    <div class="field-content">
                      {#each selected_scenario.key_questions as question}
                        - {question} <br />
                      {/each}
                    </div>
                  </div>
                  <!-- <div class="min-h-[2rem]"></div> -->
                </div>
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
  .scenario-content {
    background-color: color-mix(
      in srgb,
      var(--surface-elevated) 90%,
      transparent
    );
  }

  .scenario-button {
    background-color: var(--surface-interactive);
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
    /* background-color: var(--brand-secondary); */
    outline-color: var(--brand-secondary);
    transform: translateY(-8px), scale(1.05);

    /* font-weight: 600; */
    /* color: var(--neutral-800); */
  }

  .content-area {
    /* background-color: var(--neutral-100); */
  }

  .content-container {
    color: var(--text-primary);
  }

  .field-label {
    color: var(--brand-secondary);
    background: var(--surface-elevated);
    padding: 0.25rem 0.25rem;
    border-radius: 4px;
  }

  .field-content {
    /* color: var(--neutral-800); */
    color: var(--text-primary);
  }
</style>
