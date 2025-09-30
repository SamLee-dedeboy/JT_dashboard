<script lang="ts">
  import { createEventDispatcher, onMount, tick } from "svelte";
  import Participant from "./sections/Participant.svelte";
  import Background from "./sections/Background.svelte";
  import DriversOfChange from "./sections/DriversOfChange.svelte";
  import FutureManagement from "./sections/FutureManagement.svelte";
  import DecisionMaking from "./sections/DecisionMaking.svelte";
  import SectionHeader from "./sections/SectionHeader.svelte";
  import * as Constants from "../constants";
  import type { tDataset, tParticipantData, tSectionMetadata } from "../types";
  import type { BlockAggregator } from "../renderers/BlockAggregator";

  // Use $props() instead of export let
  let {
    section = $bindable(),
    category_metadata,
    data,
    block_aggregator,
  }: {
    section: tSectionMetadata;
    category_metadata: { [key: string]: string[] };
    data: tDataset;
    block_aggregator: BlockAggregator;
  } = $props();

  // Derived reactive value for hide column flags
  // let hide_column_flags = $derived(
  //   section?.columns.reduce(
  //     (acc, column) => {
  //       acc[column.id] = false;
  //       return acc;
  //     },
  //     {} as { [key: string]: boolean }
  //   )
  // );
</script>

{#if section.id === "participant"}
  <div class="flex max-w-[10rem] grow flex-col">
    <SectionHeader
      {category_metadata}
      bind:section
      options={{
        [Constants.participant_column_id]: Object.keys(data.participant_data),
      }}
    ></SectionHeader>
    <Participant participant_data={Object.values(data.participant_data)} />
  </div>
{:else if section.id === "background"}
  <div class="flex grow flex-col">
    <SectionHeader
      {category_metadata}
      bind:section
      options={{
        [Constants.category_column_id]: data.metadata.participant_categories,
      }}
    ></SectionHeader>
    <Background bind:section {block_aggregator} />
  </div>
{:else if section.id === "drivers_of_change"}
  <div class="flex grow flex-col">
    <SectionHeader
      {category_metadata}
      bind:section
      options={{
        [Constants.factor_column_id]: data.metadata.factor_categories,
      }}
    ></SectionHeader>
    <DriversOfChange bind:section {block_aggregator} />
  </div>
{:else if section.id === "future_management"}
  <div class="flex grow flex-col">
    <SectionHeader
      {category_metadata}
      bind:section
      options={{
        [Constants.strategy_column_id]: data.metadata.strategy_categories,
      }}
    ></SectionHeader>
    <FutureManagement bind:section {block_aggregator} />
  </div>
{:else if section.id === "decision_making"}
  <div class="flex grow flex-col">
    <SectionHeader
      {category_metadata}
      bind:section
      options={{
        [Constants.fairness_column_id]:
          data.metadata[Constants.fairness_column_id],
        [Constants.represented_column_id]: data.metadata.represented_categories,
        [Constants.not_represented_column_id]:
          data.metadata.not_represented_categories,
        [Constants.others_column_id]:
          data.metadata.others_to_include_categories,
      }}
    ></SectionHeader>
    <DecisionMaking bind:section {block_aggregator} />
  </div>
{/if}
