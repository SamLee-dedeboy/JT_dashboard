import {
  participantState,
  combinationState,
} from "../lib/flow_store.svelte";
import type { tBlock } from "../types/flow";
const colors = [
  "#AEE1D7",
  "#f8b897",
  "#f4cfdd",
  "#F9EA9A",
  "#CCC7B9",
  "#EAF9D9",
  "#C0D6DF",
  "#E2D4BA",
  "#A5FFD6",
  "#FED9B7",
  "#F07167",
  "#F6C0D0",
  "#D0A5C0",
  "#F1DEDC",
  "#E1DABD",
  "#ABC798",
];
export const combination_controller = {
  generateCombinations(target_blocks: tBlock[]) {
    let block_id_to_title_dict = target_blocks.reduce((acc, block) => {
      acc[block.id] = block.title;
      return acc;
    }, {});
    let participant_blocks: { [key: string]: string[] } = {};
    // blocks.forEach((block) => {
    target_blocks.forEach((block) => {
      const participants = block.participants;
      participants.forEach((participant) => {
        if (!participant_blocks[participant])
          participant_blocks[participant] = [];
        participant_blocks[participant].push(block.id);
      });
    });

    let combinations_set: Set<string[]> = new Set();
    Object.values(participant_blocks).forEach((block_ids) => {
      let exists = false;
      for (let existing_combination of combinations_set) {
        if (
          existing_combination.length === block_ids.length &&
          existing_combination.every((value) => block_ids.includes(value))
        ) {
          exists = true;
          break;
        }
      }
      if (!exists) combinations_set.add(block_ids);
    });

    let combinations_list = Array.from(combinations_set);
    let local_participant_combinations: { [key: string]: string } = {};
    let local_combination_content = {};
    Object.entries(participant_blocks).forEach(([participant, block_ids]) => {
      const combination_index = _get_set_index(combinations_list, block_ids);
      const combination = `c-${combination_index}`;
      local_combination_content[combination] = combinations_list[
        combination_index
      ].map((b_id) => {
        return {
          id: b_id,
          title: block_id_to_title_dict[b_id],
        };
      });
      local_participant_combinations[participant] = combination;
    });
    combinationState.combination_content = local_combination_content;
    participantState.participant_combinations = local_participant_combinations;
    participantState.mentioned_participants = Object.keys(local_participant_combinations);
  },
  setParticipantColor(
    combinations: string[],
    participant_combinations: { [key: string]: string },
  ) {
    const combination_to_participants = Object.entries(
      participant_combinations,
    ).reduce((acc, [participant, combination]) => {
      if (!acc[combination]) acc[combination] = [];
      acc[combination].push(participant);
      return acc;
    }, {});
    let local_combination_colors = {};
    let local_participant_colors = {};
    let existing_combination_number = Object.keys(
      combinationState.combination_colors,
    ).length;
    let new_combination_number = 0;
    combinations.forEach((combination) => {
      let color = "";
      if (combinationState.combination_colors[combination]) {
        color = combinationState.combination_colors[combination];
      } else {
        new_combination_number++;
        // set combinations colors by index
        color =
          colors[
            (existing_combination_number + new_combination_number) %
              colors.length
          ];
        console.log({
          existing_combination_number,
          new_combination_number,
          color,
        });
      }
      local_combination_colors[combination] = color;
      const participants = combination_to_participants[combination];
      participants.forEach((participant) => {
        local_participant_colors[participant] = color;
      });
    });
    participantState.participant_colors = local_participant_colors;
    combinationState.combination_colors = local_combination_colors;
    console.log({ combination_colors: combinationState.combination_colors });
  },
  // _generate_combinations(blocks: tBlock[]) {
  //   const block_ids = blocks.map((block) => block.id);
  //   return block_ids.flatMap((v, i) =>
  //     block_ids.slice(i + 1).map((w) => v + " " + w),
  //   );
  // },
};
function _get_set_index(set_list: string[][], target_set: string[]) {
  for (let i = 0; i < set_list.length; i++) {
    if (
      set_list[i].length === target_set.length &&
      [...set_list[i]].every((value) => target_set.includes(value))
    )
      return i;
  }
  return -1;
}
