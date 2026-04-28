<script lang="ts">
  import { onMount } from "svelte";
  import AllMMs from "./AllMMs.svelte";
  import PastExhibitionMMs from "./PastExhibitionMMs.svelte";
  import CodeTooltip from "./CodeTooltip.svelte";
  import { server_address } from "./constants";
  import { push } from "svelte-spa-router";
  import { nodeTypeColor } from "./constants";

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
  let selected_code: string | undefined = $state(undefined);
  let tooltip_y: number | undefined = $state(undefined);
  let sidebar_el = $state<HTMLDivElement | undefined>(undefined);
  let tooltip_el = $state<HTMLDivElement | undefined>(undefined);
  let tooltip_height = $state(0);

  // Track the tooltip's live height via ResizeObserver so we can clamp its
  // position against both its own size and the sidebar's bounds.
  $effect(() => {
    const el = tooltip_el;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      tooltip_height = entries[0].contentRect.height;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // Convert the hovered bubble's viewport y into a top offset inside the
  // sidebar. Because the tooltip is translated by -50%, `top` represents the
  // tooltip's VERTICAL CENTER — so clamp by half the tooltip height on each
  // end to keep the whole box inside the sidebar.
  let tooltip_top = $derived.by(() => {
    if (tooltip_y === undefined || !sidebar_el) return 0;
    const rect = sidebar_el.getBoundingClientRect();
    const halfH = tooltip_height / 2;
    const raw = tooltip_y - rect.top;
    const minTop = halfH;
    const maxTop = Math.max(minTop, rect.height - halfH);
    return Math.max(minTop, Math.min(maxTop, raw));
  });

  onMount(() => {
    fetchCodebook();
    fetchCodeTsne();
  });
</script>

<div class="page-container flex-1 flex flex-col relative">
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
    <div class="flex flex-col w-[60%] min-h-0 gap-1">
      <div class="jt-section-title text-center text-[1.5rem] text-white">
        Collective mental model of <br />
        salinity
        <span
          class="px-2"
          style={`background-color: ${nodeTypeColor["impacts salinity"]}; color: black`}
        >
          Drivers
        </span>
        and
        <span
          class="px-2"
          style={`background-color: ${nodeTypeColor["impacted by salinity"]}; color: white`}
        >
          Impacts
        </span>
      </div>
      <AllMMs
        server_data={merged_server_data}
        {code_tsne}
        {codebook}
        svgId="mm_svg"
        bind:selected_code
        bind:tooltip_y
      ></AllMMs>
    </div>
    <div
      bind:this={sidebar_el}
      class="mm-sidebar relative w-[40%] rounded p-4 text-white overflow-hidden min-h-0"
    >
      {#if merged_server_data && selected_code}
        {#key selected_code}
          <div
            bind:this={tooltip_el}
            class="absolute left-4 right-4 -translate-y-1/2 transition-all duration-200"
            style={`top: ${tooltip_top}px`}
          >
            <CodeTooltip
              {codebook}
              all_code_participants={merged_server_data}
              {selected_code}
            ></CodeTooltip>
          </div>
        {/key}
      {:else}
        <div
          class="flex h-full items-center justify-center p-4 text-center italic opacity-70"
        >
          Hover over a bubble on the left to see details about that code.
        </div>
      {/if}
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
</style>
