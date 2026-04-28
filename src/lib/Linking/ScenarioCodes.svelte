<script lang="ts">
  import { server_address } from "./constants";
  // import CodeTreeMap from "./CodeTreeMap.svelte";
  import CodeBubbles from "./CodeBubbles.svelte";
  import CodeGraph from "./CodeGraph.svelte";
  // import EquitySpace from "./EquitySpace.svelte";
  import type { tScenarioData } from "./types";
  import type { GraphNode } from "./renderers/CodeGraphRenderer";
  import { bubble_color } from "./constants";
  import { scale } from "svelte/transition";
  import InfoButton from "../InfoButton.svelte";
  import { cubicOut } from "svelte/easing";
  let {
    selected_scenario = undefined,
    selected_code = $bindable(),
  }: {
    selected_scenario?: tScenarioData;
    selected_code?: GraphNode | undefined;
  } = $props();

  function fetchScenarioCodes(scenario: tScenarioData) {
    console.log(
      "Fetching Scenario Codes for Scenario:",
      scenario.number,
      scenario.name,
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
  let info_open = $state(true);
</script>

{#key selected_scenario}
  <div class="info-panel absolute right-3 top-3 z-20 italic">
    {#if info_open}
      <div
        class="info-panel-expanded flex flex-col gap-2 rounded-md p-3 text-sm text-left"
        transition:scale={{ start: 0.85, duration: 200, easing: cubicOut }}
      >
        <div class="flex items-start justify-between gap-2">
          <span class="title-banner uppercase not-italic font-normal text-xl">
            Public Opinion
          </span>
          <button
            type="button"
            class="info-toggle shrink-0 rounded px-1.5 leading-none flex items-center justify-center"
            aria-label="Collapse info panel"
            onclick={() => (info_open = false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-minus-icon lucide-minus"
              ><path d="M5 12h14" /></svg
            >
          </button>
        </div>
        <span class="inline-flex items-start gap-2 font-normal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mt-0.5 h-5 w-5 shrink-0"
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
          <span>
            This chart shows what participants' opinions we considered for this
            scenario.
          </span>
        </span>
        <div class="ml-7 font-normal">
          Each bubble is a category of opinion. Bigger bubbles = more
          participants mentioned this category.
        </div>
        <div class="ml-7 font-normal">
          Hover any bubble to see more details.
        </div>
      </div>
    {:else}
      <div transition:scale={{ start: 0.85, duration: 200, easing: cubicOut }}>
        <InfoButton onclick={() => (info_open = true)} label="Expand info panel" />
      </div>
    {/if}
  </div>
  {#if selected_scenario}
    {#await fetchScenarioCodes(selected_scenario) then codes}
      <!-- <CodeBubbles {codes}></CodeBubbles> -->
      <CodeGraph {codes} bind:selected_code></CodeGraph>
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
  .title-banner {
    color: var(--jt-secondary);
  }

  .info-panel {
    color: var(--text-primary);
  }
  .info-panel-expanded {
    max-width: 22rem;
    transform-origin: top right;
    background-color: color-mix(
      in srgb,
      var(--surface-elevated) 92%,
      transparent
    );
    outline: 1px solid var(--border-subtle);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }
  .info-toggle {
    color: var(--text-primary);
    background-color: transparent;
    cursor: pointer;
    font-size: 1.1rem;
  }
  .info-toggle:hover {
    background-color: rgba(255, 255, 255, 0.08);
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
