<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  import Column from "./Column.svelte";
  import type { tSectionMetadata } from "../../../types/flow";
  import type { BlockAggregator } from "../../../renderers/BlockAggregator";
  export let section: tSectionMetadata;
  export let block_aggregator: BlockAggregator;

  function handleMoveColumnLeft(index: number) {
    if (index === 0) return;
    const temp = section.columns[index - 1];
    section.columns[index - 1] = section.columns[index];
    section.columns[index] = temp;
    dispatch("toggle");
  }

  function handleMoveColumnRight(index: number) {
    if (index === section.columns.length - 1) return;
    const temp = section.columns[index + 1];
    section.columns[index + 1] = section.columns[index];
    section.columns[index] = temp;
    dispatch("toggle");
  }
</script>

<div class={`section-content`}>
  <div
    class="nodes-container flex h-full justify-between gap-x-4 rounded py-1 pl-[0rem] text-sm"
  >
    {#each section.columns as column, index}
      <Column
        bind:column
        show_column_header={true}
        blocks={block_aggregator.decision_making_blocks.block_dict[column.id]}
        total_participants={block_aggregator.max_participants}
        on:moveLeft={() => handleMoveColumnLeft(index)}
        on:moveRight={() => handleMoveColumnRight(index)}
      ></Column>
      <!-- total_participants={column.id === "fairness"
          ? block_aggregator.decision_making_blocks.participants
          : block_aggregator.decision_making_blocks.total_participants} -->
    {/each}
  </div>
</div>

<style lang="postcss">
</style>
