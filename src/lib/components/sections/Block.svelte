<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import type { tBlock } from "../../../types/flow";
  import {
    participantState,
    blockState,
    uiState,
    sectionState,
  } from "../../flow_store.svelte";
  import {
    initial_to_id_dict,
    column_to_section_dict,
    column_to_participant_data_key,
    strategy_column_id,
  } from "../../../constants/flow";
  // import BlockContent from "./BlockContent.svelte";
  import * as Constants from "../../../constants/flow";

  // Use $props() instead of export let
  let {
    block,
    total_participants,
    base_space,
    grow = false,
    show_icon_list = true,
  }: {
    block: tBlock;
    total_participants: number;
    base_space: number;
    grow?: boolean;
    show_icon_list?: boolean;
  } = $props();

  // Use $derived to get state values
  const participant_colors = $derived(participantState.participant_colors);
  const participant_combinations = $derived(
    participantState.participant_combinations
  );
  const transcript_view = $derived(uiState.transcript_view);
  const view_mode = $derived(uiState.view_mode);
  const clicked_block = $derived(blockState.clicked_block);
  const clicked_normal_blocks = $derived(blockState.clicked_normal_blocks);
  const clicked_leading_blocks = $derived(blockState.clicked_leading_blocks);
  const sections = $derived(sectionState.sections);

  // Derived reactive values
  const fill = $derived(view_mode && block.column_id === strategy_column_id);

  const clicked = $derived(
    clicked_leading_blocks.map((b) => b.id).includes(block.id) ||
      clicked_normal_blocks.map((b) => b.id).includes(block.id)
  );

  const block_combinations = $derived(
    block.participants.map((pid) => {
      return participant_combinations[pid];
    })
  );

  // Local state using $state
  let show_content = $state(false);

  function setOpacity(hex, alpha) {
    return `${hex}${Math.floor(alpha * 255)
      .toString(16)
      .padStart(2, "0")}`;
  }

  function encode_height(block, total_participants) {
    return (
      (block.participants && block.participants.length > 0
        ? (base_space * block.participants.length) / total_participants
        : 0) + "%"
    );
  }

  function missing_style(target_participants) {
    return target_participants.length > 0
      ? ""
      : "opacity: 0.2; height: 5%; flex-grow: 0;pointer-events: none;";
  }

  function handleExpand(e) {
    e.preventDefault();
    if (block.content) {
      show_content = !show_content;
    }
  }

  function handleNavigate(e) {
    e.preventDefault();
    const { pid, section_id, column, target } = e.detail;
    transcript_view.show_evidence(section_id, pid, column, target);
  }

  function update_blocks(existing_blocks: tBlock[], new_block: tBlock) {
    const existing_ids = existing_blocks.map((b) => b.id);
    if (existing_ids.includes(new_block.id)) {
      return existing_blocks.filter((b) => b.id !== new_block.id);
    } else {
      return [...existing_blocks, new_block];
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  class={`block-container pointer-events-auto relative flex w-full
  max-w-[8rem]
  justify-center
  rounded 
  font-mono
  text-[0.9rem]
  outline-1 outline-gray-200
  ${grow ? "grow" : "flex-none"}
  `}
  class:showing-content={show_content}
  class:clicked
  class:leading={view_mode && block.column_id === strategy_column_id}
  style={`height:${encode_height(block, total_participants)}; ${missing_style(
    block_combinations
  )}`}
  onclick={(e) => {
    if (!e.defaultPrevented) {
      e.preventDefault();
      blockState.clicked_normal_blocks = update_blocks(
        clicked_normal_blocks,
        block
      );
    }
  }}
  onkeyup={() => {}}
  data-json={JSON.stringify({
    column: block.column_id,
    combinations: block_combinations,
    participants: block.participants,
  })}
>
  {#if view_mode && show_icon_list}
    <div class="icon-list absolute right-0 top-0 z-10 hidden">
      <div class="flex">
        <div
          role="button"
          tabindex="0"
          class="icon-container"
          onclick={(e) => {
            e.preventDefault();
            handleExpand(e);
          }}
          onkeyup={() => {}}
        >
          <img src="maximize.svg" alt="[]" />
        </div>
      </div>
    </div>
  {/if}
  <div
    id={block.id}
    class={`block-element relative flex w-full flex-col items-center justify-center rounded p-1 text-center`}
    style={`background-color: ${
      fill
        ? setOpacity(participant_colors[block.participants[0]], 0.7)
        : "white"
    }; `}
    data-json={JSON.stringify({
      column: block.column_id,
      combinations: block_combinations,
      participants: block.participants,
    })}
  >
    <div
      class="w-full select-none"
      style={`font-size: ${
        block.participants.length > 5 ? "0.9rem" : "0.7rem"
      }; line-height: ${block.participants.length > 5 ? "1.2" : "1"}`}
    >
      {block.title}
      {#if block.column_id !== Constants.fairness_column_id}
        <div class="absolute right-[100%] top-1/2 text-gray-500">
          ({block.participants.length})
        </div>
      {/if}
    </div>
  </div>
  <!-- {#if block.content && show_content}
    <div
      transition:fade
      id={`${block.id}-content`}
      style={`z-index: 1000;`}
      class={`absolute left-[100%] max-h-[15rem] min-h-[12rem] max-w-[18rem] flex-1 cursor-default overflow-y-scroll rounded border border-solid border-black bg-white p-0.5 px-1 shadow-[0px_0px_1px_1px_gray]`}
      data-json={JSON.stringify(block_combinations)}
    >
      <BlockContent
        section_id={column_to_section_dict[block.column_id]}
        column_id={block.column_id}
        current_category={block.title}
        content={block.content.sort(
          (a, b) =>
            Constants.initial_to_id_dict[a[0]] -
            Constants.initial_to_id_dict[b[0]]
        )}
        on:hide={(e) => handleExpand(e)}
        on:navigate={(e) => handleNavigate(e)}
      ></BlockContent>
    </div>
  {/if} -->
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .block-container:hover .icon-list {
    /* display: flex; */
  }
  .icon-container {
    @apply flex h-4 w-4 items-center justify-center p-0.5 hover:bg-gray-300;
  }
  .showing-content {
    @apply bg-gray-200;
  }
  .clicked {
    @apply rounded shadow-[0px_0px_2px_2px_gray] outline outline-gray-400 brightness-[95%];
  }
  .leading {
    @apply max-w-[12rem];
  }
</style>
