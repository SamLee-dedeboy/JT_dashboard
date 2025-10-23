<script lang="ts">
  let { bubble, handleExpand, handleClose } = $props();
  import { server_address } from "./constants";
  import { bubble_color } from "./constants";
  import { setOpacity } from "../../constants";

  $effect(() => {
    if (bubble) {
      fetchSummarization();
    }
  });
  function fetchSummarization() {
    console.log(
      "Fetching summarization for bubble:",
      bubble,
      bubble.id.split("\\").at(-1)
    );

    return fetch(`${server_address}/codes/summarize/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: bubble.data.name }),
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
</script>

<div
  class="tooltip-content h-1 grow overflow-hidden text-lg flex divide-x divide-dashed divide-gray-400 relative gap-2"
>
  <div class="flex-1 text-left p-1">
    <div class="flex justify-between items-start mb-2">
      <div class="flex-1">
        <p>
          You're looking at participant responses about
          <span
            class="italic px-3 py-0.5 rounded text-black"
            style={`background-color: ${setOpacity(bubble_color(bubble.id.split("\\").at(0)), 0.9, "rgbHex")}`}
          >
            {bubble.id.split("\\").at(-1)}
          </span>
        </p>
      </div>
    </div>
    <p>
      <span class="underline">
        {bubble.data.participants.length}
      </span>
      participants mentioned this in the interview.
    </p>
    <span>
      <button
        class="expand-button mt-4 px-2 py-1 rounded shadow-md text-sm outline-2 outline-slate-200 text-black"
        onclick={() => handleExpand(bubble)}>Expand</button
      > to see its children.
    </span>
  </div>
  <div class="flex-2 relative overflow-y-auto">
    <button
      class="close-button text-xl leading-none absolute right-0 top-0"
      onclick={() => handleClose()}
      title="Close"
    >
      ×
    </button>
    <!-- <p class="bg-slate-300 px-2 py-1 rounded mt-2">
      Summary of the participants responses:
    </p> -->
    <!-- <p
    class="text-slate-700 text-sm bg-gray-200 mx-1 px-2 py-1 rounded shadow-md"
  >
    - Freshwater flow is essential to push back saltwater intrusion in Delta
    ecosystems. - Groundwater recharge projects are necessary to store
    freshwater for combating salinity and improving system resilience. - Climate
    change demands strategies to manage increased rainfall and flood flows while
    addressing water scarcity. - Building more reservoirs may not be a
    comprehensive solution to Delta salinity issues. - Erosion and soil health
    are critical considerations for managing Delta watersheds effectively.
  </p> -->
    {#await fetchSummarization()}
      <p>...</p>
    {:then summarization}
      <p class="text-[1rem] text-left whitespace-pre-wrap pl-2">
        <!-- {summarization.length > 0 ? summarization : "No summary available."} -->
        {summarization}
      </p>
    {/await}
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
</style>
