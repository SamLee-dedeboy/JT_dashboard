<script lang="ts">
  import type { tSectionMetadata } from "../../types";
  import Column from "./Column.svelte";
  import type { BlockAggregator } from "../../renderers/BlockAggregator";
  export let section: tSectionMetadata;
  export let block_aggregator: BlockAggregator;
</script>

<div class={`section-content`}>
  {#each section.columns as column}
    <Column
      {column}
      blocks={block_aggregator.background_blocks?.category_blocks}
      total_participants={block_aggregator.background_blocks.total_participants}
    />
  {/each}
</div>
