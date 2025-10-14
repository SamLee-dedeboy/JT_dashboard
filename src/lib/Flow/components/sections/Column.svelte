<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { blockState, uiState } from "../../flow_store.svelte";
  const dispatch = createEventDispatcher();
  import type { tBlock, tColumnMetadata } from "../../types";
  import Block from "./Block.svelte";
  import ColumnHeader from "./ColumnHeader.svelte";

  // Use $props() instead of export let
  let {
    column = $bindable(),
    blocks,
    show_column_header = false,
    total_participants,
  }: {
    column: tColumnMetadata;
    blocks: tBlock[];
    show_column_header?: boolean;
    total_participants: number;
  } = $props();

  // Use $derived to get state values
  const leading_column = $derived(blockState.leading_column);
  const base_blocks = $derived(blockState.base_blocks);
  const view_mode = $derived(uiState.view_mode);

  // Derived reactive value
  let sorted_blocks = $derived(
    _sorted_blocks(blocks, leading_column, base_blocks)
  );

  function _sorted_blocks(
    _blocks: tBlock[],
    leading_column: string,
    base_blocks: tBlock[]
  ) {
    // if (view_mode) return _blocks;
    if (column.id !== leading_column) return _blocks;
    const base_block_length1_index = _blocks.indexOf(base_blocks[0]);
    const base_block_length2_index = _blocks.indexOf(base_blocks[1]);
    const filtered_blocks = _blocks.filter(
      (_, index) =>
        index !== base_block_length1_index && index !== base_block_length2_index
    );
    const block_participant_lengths = filtered_blocks.map(
      (b) => b.participants.length
    );
    // extract block length array without base blocks
    // find a cutoff such that left and right are most balanced
    let diff = 1000;
    let pivot_index = 0;
    // this works only if block_participant_lengths is sorted
    for (let i = 0; i < block_participant_lengths.length; i++) {
      const left = block_participant_lengths.slice(0, i);
      const right = block_participant_lengths.slice(i);
      if (Math.abs(sum(left) - sum(right)) < diff) {
        diff = Math.abs(sum(left) - sum(right));
        pivot_index = i;
      } else {
        break;
      }
    }
    return filtered_blocks
      .slice(0, pivot_index)
      .concat(base_blocks)
      .concat(filtered_blocks.slice(pivot_index));
  }

  function sum(array: number[]) {
    return array.reduce((a, b) => a + b, 0);
  }
</script>

<div
  class="question-container flex h-full w-fit flex-col items-center justify-start"
>
  {#if show_column_header}
    <ColumnHeader
      id={column.id}
      title={column.title}
      bind:hidden={column.hidden}
    ></ColumnHeader>
  {/if}
  <div
    class="mt-1 flex grow flex-col items-center justify-around gap-y-2 px-1"
    style={`${column.hidden ? "display: none" : ""}`}
  >
    {#each sorted_blocks as block, index}
      <Block {block} {total_participants} base_space={95} />
    {/each}
  </div>
</div>

<style lang="postcss">
</style>
