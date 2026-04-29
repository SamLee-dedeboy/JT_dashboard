<script lang="ts">
  import { server_address } from "./constants";
  import { bubble_color, contrastTextColor } from "./constants";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  let { code, handleExpand = undefined, handleClose } = $props();
  $effect(() => {
    console.log({ code });
    if (code) {
      fetchSummarization();
    }
  });
  function fetchSummarization() {
    console.log(
      "Fetching summarization for code:",
      code,
      code.id.split("\\").at(-1),
    );

    return fetch(`${server_address}/codes/summarize/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code.id }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Summarization", data);
        return data;
      })
      .catch((error) => {
        console.error("Error:", error);
        return "";
      });
  }
  onMount(() => {
    console.log("Mounted GraphNodeTooltip with code:", code);
  });
</script>

<div
  class="modal-content flex flex-col min-h-[400px] overflow-y-auto text-left text-white"
>
  <div class="flex justify-between items-start mb-4">
    <div class="flex-1">
      <h4 class="mb-2">
        You're looking at participant responses about
        <span
          class="category-chip px-3 py-1 rounded ml-1 text-[1rem]"
          style={`background-color: color-mix(in srgb, ${bubble_color(code.id.split("\\").at(0))} 90%, transparent); color: ${contrastTextColor(bubble_color(code.id.split("\\").at(0)))}`}
        >
          {code.depth <= 1
            ? code.id.split("\\").at(-1)?.toUpperCase()
            : code.id.split("\\").at(-1)}
        </span>
      </h4>
    </div>
    <!-- <button
      class="close-button text-2xl text-gray-500 hover:text-gray-700 rounded-full w-8 h-8 flex items-center justify-center leading-none hover:bg-gray-100 transition-colors"
      onclick={() => handleClose()}
      title="Close"
    >
      ×
    </button> -->
  </div>

  <div class="mb-4">
    <p class="">
      <span class=" underline">
        {code.participantCount}
      </span>
      participants mentioned this in the interview.
    </p>
    {#if handleExpand}
      <div class="mt-4">
        <button
          class="expand-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors shadow-md"
          onclick={() => handleExpand(code)}>Expand</button
        > to see its children.
      </div>
    {/if}
  </div>

  <div class="flex-1 overflow-y-auto">
    <!-- <p class="text-lg mb-3">Summary of participant responses:</p> -->
    {#await fetchSummarization()}
      <div class="flex items-center justify-center py-8">
        <div class="text-gray-500">Loading summary...</div>
      </div>
    {:then summarization}
      <div class="py-4 rounded-lg text-left" in:slide>
        <p class="leading-relaxed whitespace-pre-wrap">
          {summarization || "No summary available."}
        </p>
      </div>
    {/await}
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .modal-content {
    font-family: "Hammersmith One", sans-serif;
  }
  .category-chip {
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    line-height: 1.8;
    padding: 0.25rem 0.6rem;
    border-radius: 0.5rem;
  }
</style>
