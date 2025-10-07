<script lang="ts">
  import { server_address } from "./constants";
  // import CodeTreeMap from "./CodeTreeMap.svelte";
  import CodeBubbles from "./CodeBubbles.svelte";
  // import EquitySpace from "./EquitySpace.svelte";
  import type { tScenarioData } from "./types";
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
</script>

{#key selected_scenario}
  <div
    class="header-container font-bold italic justify-center items-center flex flex-col"
  >
    <span class="title-banner w-full text-center text-[2.5rem]">
      Public Opinion
    </span>
    <div
      class="info-text px-1 font-mono text-[1rem] font-normal w-full flex flex-col"
    >
      <span class="inline-flex flex-wrap items-center">
        <img src="info.svg" class="w-5 h-5 inline mr-2" alt="info" />
        This chart shows the distribution of participants' responses in our interview.
      </span>
      <span class="">
        Each bubble is a category. Bigger bubbles indicate
        <span class="font-semibold whitespace-normal">
          &nbsp;more participants mentioned this category.
        </span>
      </span>
      <span>
        Click any bubble and use the buttons on the left to interact with it.
      </span>
    </div>
  </div>
  {#if selected_scenario}
    {#await fetchScenarioCodes(selected_scenario) then codes}
      <CodeBubbles {codes}></CodeBubbles>
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
    color: var(--text-primary);
  }

  .info-text {
    color: var(--text-primary);
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
