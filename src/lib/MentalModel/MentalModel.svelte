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
  onMount(() => {
    fetchCodebook();
    fetchCodeTsne();
  });
</script>

<div class="page-container flex-1 flex flex-col">
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

  <div class="flex justify-between gap-8 grow">
    <div class="flex flex-col flex-1">
      <div class="jt-section-title text-center text-[1.5rem] text-white">
        Interview Mental Models
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
        Exhibition Mental Models
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

  h1 {
    color: #646cff;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
  :global(.is_top) {
    fill: var(--jt-secondary);
  }
  :global(.is_bottom) {
    fill: var(--neutral-500);
  }
</style>
