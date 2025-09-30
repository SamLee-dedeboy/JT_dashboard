<script lang="ts">
  import AllMMs from "./AllMMs.svelte";
  import PastExhibitionMMs from "./PastExhibitionMMs.svelte";
  import { push } from "svelte-spa-router";

  function goBack() {
    push("/");
  }
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
    <div class="flex flex-col w-[45%]">
      <div class="jt-section-title text-center text-[1.5rem] text-white">
        Interview Mental Models
      </div>
      <AllMMs></AllMMs>
    </div>
    <div class="flex flex-col grow">
      <div class="jt-section-title text-center text-[1.5rem] text-white">
        Exhibition Mental Models
      </div>
      <div
        class="flex flex-wrap grow justify-between gap-4 h-1 overflow-y-auto pr-3"
      >
        <PastExhibitionMMs></PastExhibitionMMs>
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
</style>
