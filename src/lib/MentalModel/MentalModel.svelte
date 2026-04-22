<script lang="ts">
  import { onMount } from "svelte";
  import AllMMs from "./AllMMs.svelte";
  import PastExhibitionMMs from "./PastExhibitionMMs.svelte";
  import { server_address } from "./constants";
  import { push } from "svelte-spa-router";

  // function goBack() {
  //   push("/");
  // }

  let codebook: any = $state([]);
  let code_tsne: Record<string, number> = $state({});
  let interview_server_data: any = $state(undefined);
  let exhibition_server_data: any = $state(undefined);

  // Merge interview + exhibition into a single { code -> participants[] } map.
  // Participants are deduped per code via Set so overlapping IDs (if any) don't
  // double-count. Returns undefined until at least one source has loaded.
  let merged_server_data = $derived.by(() => {
    if (!interview_server_data && !exhibition_server_data) return undefined;
    const merged: Record<string, string[]> = {};
    const sources = [interview_server_data, exhibition_server_data].filter(
      Boolean,
    );
    sources.forEach((src) => {
      Object.keys(src).forEach((code) => {
        if (!merged[code]) merged[code] = [];
        merged[code] = merged[code].concat(src[code]);
      });
    });
    Object.keys(merged).forEach((code) => {
      merged[code] = Array.from(new Set(merged[code]));
    });
    return merged;
  });
  function fetchCodebook() {
    fetch(`${server_address}/codebook/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Codebook:", data);
        codebook = data;
        fetchInterviewMMs();
        fetchExhibitionMMs();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function fetchCodeTsne() {
    fetch(`${server_address}/codebook/parent_tsne/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("TSNE Data:", data);
        code_tsne = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function fetchInterviewMMs() {
    fetch(`${server_address}/mental_model/interview/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        interview_server_data = data;
        console.log("server data", interview_server_data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function fetchExhibitionMMs() {
    fetch(`${server_address}/mental_model/exhibition/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        exhibition_server_data = data;
        console.log("server data", exhibition_server_data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  let tutorial_open = $state(true);

  onMount(() => {
    fetchCodebook();
    fetchCodeTsne();
  });
</script>

<div class="page-container flex-1 flex flex-col relative">
  <button
    type="button"
    class="tutorial-trigger absolute top-2 left-2 flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium"
    onclick={() => (tutorial_open = true)}
  >
    <span aria-hidden="true">?</span>
    Tutorial
  </button>
  <div class="flex">
    <!-- <button
      on:click={goBack}
      class="back-button flex items-center gap-2 px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
      Back to Home
    </button> -->
  </div>

  <div class="flex grow gap-6 relative min-h-0">
    <div class="flex flex-col w-[60%] min-h-0">
      <div class="jt-section-title text-center text-[1.5rem] text-white">
        Mental Models (48)
      </div>
      <AllMMs
        server_data={merged_server_data}
        {code_tsne}
        {codebook}
        svgId="mm_svg"
      ></AllMMs>
    </div>
    <div
      class="mm-sidebar flex w-[40%] flex-col items-center justify-center rounded p-4 text-center text-white italic"
    >
      <span class="opacity-70">Placeholder for additional text.</span>
    </div>
  </div>
</div>

{#if tutorial_open}
  <div
    class="tutorial-overlay fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="mm-tutorial-title"
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
        <h2 id="mm-tutorial-title" class="text-lg font-semibold">
          How to read these Mental Models
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
          This page lets you compare mental models from 2023 public interviews
          and 2025 exhibition participants.
        </p>
        <p>The participants were asked two main questions:</p>
        <ul class="list-disc list-outside pl-5">
          <li class="underline">
            What factors do you think have the most influence on Delta Salinity
            management?
          </li>
          <li class="underline">
            What is most at risk if salinity increases in the Delta?
          </li>
        </ul>
        <p>
          Through these mental models we can create a shared understanding for
          future salinity management strategies in the delta.
        </p>
        <p class="italic opacity-80">
          Tip: Click a node to inspect its statistics.
        </p>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  @reference "tailwindcss";
  .page-container {
    padding: 2rem;
    text-align: center;
  }

  .back-button {
    align-self: flex-start;
  }

  /* h1 {
    color: #646cff;
    margin-bottom: 1rem;
  } */

  .tutorial-trigger {
    background-color: var(--brand-primary);
    color: white;
    cursor: pointer;
    transition: filter 0.15s;
    z-index: 20;
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
</style>
