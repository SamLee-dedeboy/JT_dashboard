<script lang="ts">
  import { server_address } from "./constants";
  // import CodeTreeMap from "./CodeTreeMap.svelte";
  import CodeBubbles from "./CodeBubbles.svelte";
  import CodeGraph from "./CodeGraph.svelte";
  // import EquitySpace from "./EquitySpace.svelte";
  import type { tScenarioData } from "./types";
  import { bubble_color } from "./constants";
  let { selected_scenario = undefined } = $props();

  function fetchScenarioCodes(scenario: tScenarioData) {
    console.log(
      "Fetching Scenario Codes for Scenario:",
      scenario.number,
      scenario.name
    );
    return fetch(server_address + `/scenarios/codes_manual/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenario: scenario.number }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scenario Codes:", data);
        // return data["occurrences"];
        return data["participants"];
      })
      .catch((error) => {
        console.error("Error:", error);
        return error;
      });
  }
  const categories = ["Drivers", "Strategies", "Value", "Governance"];
</script>

{#key selected_scenario}
  <div
    class="header-container italic justify-center items-center flex flex-col relative"
  >
    <span
      class="title-banner w-full text-center text-[2.5rem] uppercase absolute top-0 -translate-y-full"
    >
      Public Opinion
    </span>
    <div
      class="info-text px-1 text-[1rem] font-normal w-full flex flex-col absolute top-0"
    >
      <span class="inline-flex">
        <!-- <img src="info.svg" class="info-icon w-5 h-5 inline mr-2" alt="info" /> -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="info-icon w-5 h-5 inline mr-2"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path
            d="M12 8h.01"
          /></svg
        >
        This chart shows what participants' opinions we considered for this scenario.
      </span>
      <span class="text-left ml-7">
        Each bubble represents a category of opinion. Bigger bubbles =
        <span class=""> more participants mentioned this category. </span>
      </span>
      <span class="text-left ml-7">
        Click any bubble to see more details.
      </span>
    </div>
    <!-- <div
      class="absolute right-2 top-1 flex flex-col justify-center gap-y-2 text-white"
    >
      {#each categories as category}
        <div class="flex items-center gap-x-2 text-sm">
          <svg class="w-6 h-6" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="5" fill={bubble_color(category)} />
          </svg>
          <span>{category}</span>
        </div>
      {/each}
    </div> -->
  </div>
  {#if selected_scenario}
    {#await fetchScenarioCodes(selected_scenario) then codes}
      <!-- <CodeBubbles {codes}></CodeBubbles> -->
      <CodeGraph {codes}></CodeGraph>
      <!-- <CodeTreeMap {codes}></CodeTreeMap> -->
      <!-- <EquitySpace></EquitySpace> -->
    {:catch error}
      <p class="error-message">error {error.message}</p>
    {/await}
  {:else}
    <div class="flex-1 items-center justify-center flex text-3xl italic">
      <span class="select-hint p-5 rounded">
        Select a scenario on the left to see public opinion.
      </span>
    </div>
  {/if}
{/key}

<style lang="postcss">
  .header-container {
    color: var(--neutral-700);
  }

  .title-banner {
    /* background-color: var(--neutral-100); */
    color: var(--jt-secondary);
  }

  .info-text {
    color: var(--text-primary);
  }

  .info-icon svg {
    stroke: white;
  }
  .select-hint {
    color: var(--text-primary);
    /* box-shadow: 0px 0px 10px var(--accent-danger); */
  }
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 var(--accent-danger);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
    }
  }
  .error-message {
    color: var(--accent-danger);
  }
</style>
