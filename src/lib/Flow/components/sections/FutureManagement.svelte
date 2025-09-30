<script lang="ts">
  import type { tSectionMetadata } from "../../types";
  import Column from "./Column.svelte";
  import type { BlockAggregator } from "../../renderers/BlockAggregator";
  export let section: tSectionMetadata;
  export let block_aggregator: BlockAggregator;
</script>

<div class={`section-content items-center justify-center`}>
  {#each section.columns as column}
    <Column
      {column}
      blocks={block_aggregator.future_management_blocks.strategy_blocks}
      total_participants={block_aggregator.max_participants}
    />
  {/each}
  <!-- total_participants={block_aggregator.future_management_blocks .total_participants} -->
</div>
