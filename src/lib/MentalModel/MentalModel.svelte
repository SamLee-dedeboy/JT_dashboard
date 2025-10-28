<script lang="ts">
  import { onMount } from "svelte";
  import AllMMs from "./AllMMs.svelte";
  import PastExhibitionMMs from "./PastExhibitionMMs.svelte";
  import { server_address } from "./constants";
  import { push } from "svelte-spa-router";
  import { slide } from "svelte/transition";

  // function goBack() {
  //   push("/");
  // }

  let codebook: any = $state([]);
  let code_tsne: Record<string, number> = $state({});
  let interview_server_data: any = $state(undefined);
  let exhibition_server_data: any = $state(undefined);
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
  let tutorialExpanded = $state(false);

  function toggleTutorial() {
    tutorialExpanded = !tutorialExpanded;
  }

  onMount(() => {
    fetchCodebook();
    fetchCodeTsne();
  });
</script>

<div class="page-container flex-1 flex flex-col relative">
  <div class="tutorial absolute top-[-1.5rem] max-w-[40rem] left-1/3 z-10">
    <div class="text-left mt-2 px-3 pb-1">
      <div class="flex items-start justify-between">
        <p class="flex-1 text-white">
          This page lets you compare mental models from a 2023 public interviews
          and a 2025 exhibition participants.
        </p>
        <button
          onclick={toggleTutorial}
          class="ml-3 p-1 duration-200 !bg-none"
          aria-label={tutorialExpanded
            ? "Collapse tutorial"
            : "Expand tutorial"}
        >
          <img
            src="arrow-down.svg"
            alt="Toggle arrow"
            class="w-4 h-4 transition-transform duration-200 {tutorialExpanded
              ? 'rotate-180'
              : ''}"
          />
        </button>
      </div>
      {#if tutorialExpanded}
        <div in:slide class="text-white">
          <p>The participants were asked two main question:</p>
          <ul class="list-disc list-outside pl-4">
            <li class="underline">
              What factors do you think have the most influence on Delta
              Salinity management?
            </li>
            <li class="underline">
              What is most at risk if salinity increases in the Delta?
            </li>
          </ul>
          <p>
            Through this mental model we can create a shared understanding for
            future salinity management strategies in the delta.
          </p>

          <p class="mt-2">Tip: Click a node to inspect its statistics.</p>
        </div>
      {/if}
    </div>
  </div>
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

  <div class="flex justify-between gap-8 grow relative">
    <div class="flex flex-col flex-1">
      <div class="jt-section-title text-center text-[1.5rem] text-white">
        Interview Mental Models (39)
      </div>
      <AllMMs
        server_data={interview_server_data}
        {code_tsne}
        {codebook}
        svgId="interview_mm_svg"
      ></AllMMs>
    </div>
    <div class="flex flex-col grow flex-1">
      <div class="jt-section-title text-center text-[1.5rem] text-white">
        Exhibition Mental Models (9)
      </div>
      <div
        class="flex flex-wrap grow justify-between gap-4 h-1 overflow-y-auto pr-3"
      >
        <!-- <PastExhibitionMMs></PastExhibitionMMs> -->
        <AllMMs
          server_data={exhibition_server_data}
          {code_tsne}
          {codebook}
          svgId="exhibition_mm_svg"
        ></AllMMs>
      </div>
    </div>
  </div>
</div>

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

  :global(.is_top) {
    fill: var(--bg-drivers);
  }
  :global(.is_bottom) {
    fill: var(--bg-impacted);
  }
  .tutorial {
    background-color: var(--bg-page);
    outline: 2px solid var(--brand-primary);
    border-radius: 4px;
  }
</style>
