<script lang="ts">
  import type { tBlock, tParticipantData } from "../../../types/flow";
  import Block from "./Block.svelte";
  import * as Constants from "../../../constants/flow";
  export let participant_data: tParticipantData[];
  let participant_blocks: tBlock[] = [];
  participant_blocks = [];
  participant_data.forEach((p_data) => {
    const id = p_data.id;
    participant_blocks.push({
      id: Constants.participant_column_id + id,
      column_id: Constants.participant_column_id,
      title: id,
      participants: [id],
      content: undefined,
    });
  });
  participant_blocks = participant_blocks.sort(
    (a, b) =>
      Constants.initial_to_id_dict[a.title] -
      Constants.initial_to_id_dict[b.title]
  );

  let block_participants = participant_blocks.map((block) => [
    block.id,
    block.participants,
  ]);
  let total_participants = participant_blocks.reduce(
    (acc, cur) => acc + (cur.participants?.length || 0),
    0
  );

  export function get_block_participants() {
    return block_participants;
  }
</script>

<div class={`section-content flex`}>
  <div
    class="nodes-container flex space-around h-full text-sm gap-x-12 p-1 rounded items-center justify-center"
  >
    <div class="flex flex-col flex-initial w-fit h-full">
      <div class="participants-container question-container">
        {#each participant_blocks as participant_block, index}
          <Block
            block={participant_block}
            {total_participants}
            base_space={75}
            fill={true}
            grow={false}
            show_icon_list={false}
          />
        {/each}
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .question-container {
    @apply flex flex-col justify-around items-center h-full;
  }
</style>
