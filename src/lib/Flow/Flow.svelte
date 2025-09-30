<script lang="ts">
  import type { tDataset, tParticipantData, tBlock } from "./types";
  import InterviewFlow from "./components/InterviewFlow.svelte";
  import { server_address } from "./constants";
  import * as Constants from "./constants";
  import { BlockAggregator } from "./renderers/BlockAggregator";
  import {
    participantState,
    blockState,
    uiState,
    sectionState,
  } from "./flow_store.svelte";
  import { combination_controller } from "./renderers/CombinationController";
  import Block from "./components/sections/Block.svelte";
  import { onMount } from "svelte";

  // Use $derived to get state values
  const all_participants = $derived(participantState.all_participants);
  const transcript_view = $derived(uiState.transcript_view);
  const category_options = $derived(sectionState.category_options);
  const sections = $derived(sectionState.sections);
  const base_blocks = $derived(blockState.base_blocks);
  const leading_blocks = $derived(blockState.leading_blocks);
  const leading_column = $derived(blockState.leading_column);
  const view_mode = $derived(uiState.view_mode);
  const clicked_leading_blocks = $derived(blockState.clicked_leading_blocks);
  const clicked_normal_blocks = $derived(blockState.clicked_normal_blocks);
  const showing_introduction = $derived(uiState.showing_introduction);

  // Convert to reactive state
  let category_metadata = $state<{ [key: string]: string[] }>({});
  let data = $state<tDataset>({} as tDataset);
  let block_aggregator = $state<BlockAggregator>({} as BlockAggregator);
  let transcripts = $state<tParticipantData[]>([]);
  let init_done = $state(false);

  async function fetchData() {
    // fetch data from backend
    await fetch(server_address + "/data/")
      .then((response) => response.json())
      .then((res: tDataset) => {
        console.log({ res });
        data = res;
        // blocks
        block_aggregator = new BlockAggregator(res);
        blockState.leading_blocks =
          block_aggregator.future_management_blocks.strategy_blocks;
        blockState.leading_column = Constants.strategy_column_id;
        category_metadata = res.category_dict;

        // set participant colors
        setParticipantColor(false, leading_blocks);
        // transcripts
        const participants = Object.keys(res.participant_data);
        transcripts = participants.map((pid) => res.participant_data[pid]);
        transcripts = transcripts.map((t) => {
          let tmp = { ...t };
          tmp.deid = Constants.initial_to_id_dict[t.id];
          tmp.pid = tmp.id.split("_")[0];
          return tmp;
        });
        transcripts = transcripts.sort((a, b) => a.deid - b.deid);

        // set store
        (res.metadata as any)[Constants.fairness_column_id] = [
          "fair",
          "unfair",
        ];
        sectionState.category_options = res.metadata as {
          [key: string]: string[];
        };
        participantState.all_participants = participants;
        init_done = true;
      });
  }

  function setParticipantColor(
    comparison_mode: boolean,
    leading_blocks: tBlock[]
  ) {
    updateDefaultBaseBlocks(leading_blocks);
    console.log("set participant color", { comparison_mode });
    if (comparison_mode) {
      // color_controller.setParticipantColor(base_blocks);
    } else {
      combination_controller.generateCombinations(leading_blocks);
    }
  }

  function updateDefaultBaseBlocks(leading_blocks: tBlock[]) {
    const middle_block_index = Math.floor(leading_blocks.length / 2);
    blockState.base_blocks = [
      leading_blocks[middle_block_index],
      leading_blocks[middle_block_index + 1],
    ];
  }

  onMount(() => {
    fetchData();
  });
</script>

{#if init_done}
  <InterviewFlow {category_metadata} {data} {block_aggregator}></InterviewFlow>
{/if}
