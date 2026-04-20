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
      <div class="flex grow gap-y-2">
        <div class="selector flex flex-col gap-y-4 z-10">
          <!-- <div class="scenario-label italic text-left pl-1">Scenarios:</div> -->
          <div
            class="flex flex-col gap-x-4 gap-y-4 flex-wrap mx-1 grow justify-between"
          >
            {#each scenario_overview as scenario}
              <button
                class="scenario-button max-w-[9rem] min-h-[4rem] text-lg italic outline outline-2 rounded px-4 py-2 uppercase transition-all"
                class:active={selected_scenario?.name === scenario.name}
                onclick={() =>
                  (selected_scenario = scenario_overview?.find(
                    (s) => s.name === scenario.name,
                  ))}
              >
                {scenario.name}
              </button>
            {/each}
          </div>
        </div>
        <div class="content-area flex flex-col grow">
          <div class="content-container px-4 flex rounded relative gap-1">
            {#if selected_scenario}
              {#key selected_scenario.name}
                <!-- <div class="p-1 absolute left-0 right-0 top-0 bottom-0"> -->
                <div class="">
                  <img
                    src={`scenario_imagery/${selected_scenario.name}.jpg`}
                    alt="Scenario Image"
                    class=" object-contain"
                  />
                </div>
                <div
                  class="scenario-content flex p-2 flex-col min-w-[18rem] relative shadow-[0_1px_6px_rgb(81,162,189,0.5)]"
                  in:slide
                >
                  <div class="p-1 text-left">
                    <!-- <span class="field-label"> Description - </span> -->
                    <span class="field-name text-2xl font-semibold">
                      {selected_scenario.name}
                    </span>
                  </div>
                  <div class="p-1 text-left">
                    <!-- <span class="field-label"> Description - </span> -->
                    <span class="field-content">
                      {selected_scenario.narrative}
                    </span>
                  </div>
                  <!-- <div class="mt-2 px-1 text-left">
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
                  </div> -->
                </div>
              {/key}
            {/if}
          </div>
          <div class="mx-2 mt-2 min-h-20 grow outline-1 outline-gray-100">
            PlaceHolder
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
    outline-color: var(--jt-blue);
    box-shadow: 0 2px 10px rgba(81, 162, 189, 0.35);
    animation: pulse-shadow 3s ease-in-out infinite;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      outline-color 0.25s ease;
  }

  .scenario-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(81, 162, 189, 0.45);
  }

  /* Stagger the pulse so buttons don't breathe in unison */
  .scenario-button:nth-of-type(2) {
    animation-delay: 0.75s;
  }
  .scenario-button:nth-of-type(3) {
    animation-delay: 1.5s;
  }
  .scenario-button:nth-of-type(4) {
    animation-delay: 2.25s;
  }
  .scenario-button:nth-of-type(5) {
    animation-delay: 3s;
  }

  @keyframes pulse-shadow {
    0%,
    100% {
      box-shadow: 0 2px 10px rgba(81, 162, 189, 0.35);
    }
    50% {
      box-shadow:
        0 4px 20px rgba(81, 162, 189, 0.55),
        0 0 15px rgba(126, 217, 87, 0.25);
    }
  }

  .active {
    outline-color: var(--jt-green);
    animation: none;
    box-shadow:
      0 4px 20px rgba(126, 217, 87, 0.5),
      0 0 15px rgba(126, 217, 87, 0.35);
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
