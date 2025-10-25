<script lang="ts">
  import type { tDataset, tSectionMetadata } from "../types";
  import Section from "./Section.svelte";
  import type { BlockAggregator } from "../renderers/BlockAggregator";
  import { onMount } from "svelte";

  // Use $props() instead of export let
  let {
    total_sections,
    total_columns,
    index,
    section = $bindable(),
    data,
    category_metadata,
    block_aggregator,
  }: {
    total_sections: number;
    total_columns: number;
    index: number;
    section: tSectionMetadata;
    data: tDataset;
    category_metadata: { [key: string]: string[] };
    block_aggregator: BlockAggregator;
  } = $props();
  onMount(() => {
    console.log("SectionWrapper mounted", section);
  });
</script>

{#if section?.hidden}
  <div
    role="button"
    tabindex="0"
    class="show-icon-container pointer-events-auto relative h-[1.5rem] w-[1.5rem] cursor-pointer hover:bg-gray-300"
    style={`z-index: ${10 * total_sections - index}`}
    onclick={(e) => {
      e.preventDefault();
      section.hidden = false;
    }}
    onkeyup={() => {}}
  >
    <img src="folder-plus.svg" alt="show" />
    <span class="hidden-section-title hidden w-max"> {section.title}</span>
  </div>
{:else}
  <div
    class="section-container pointer-events-none flex flex-col"
    class:leading_section={false}
    style={`width: ${
      (100 * section.columns.length) / total_columns
    }%; z-index: ${10 * (total_sections - index)}`}
  >
    <Section bind:section {data} {category_metadata} {block_aggregator}
    ></Section>
  </div>
{/if}
