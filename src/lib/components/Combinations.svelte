<script lang="ts">
  import { slide, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  import {
    participantState,
    blockState,
    combinationState,
    sectionState,
  } from "../flow_store.svelte";
  import { getContext, onMount } from "svelte";
  import { initial_to_id_dict } from "../../constants/flow";
  import type { BlockAggregator } from "../../renderers/BlockAggregator";
  import { combination_controller } from "../../renderers/CombinationController";

  // Use $props() instead of export let
  let {
    leading_section_title,
    block_aggregator,
  }: {
    leading_section_title: string;
    block_aggregator: BlockAggregator;
  } = $props();

  // const updateParticipantColors: any = getContext("updateParticipantColors");

  // Use $derived to get state values
  const combination_colors = $derived(combinationState.combination_colors);
  const base_blocks = $derived(blockState.base_blocks);
  const combination_content = $derived(combinationState.combination_content);
  const participant_combinations = $derived(
    participantState.participant_combinations
  );
  const all_participants = $derived(participantState.all_participants);
  const sections = $derived(sectionState.sections);
  const highlighted_combinations = $derived(
    combinationState.highlighted_combinations
  );
  const rendered_combinations = $derived(
    combinationState.rendered_combinations
  );
  const leading_blocks = $derived(blockState.leading_blocks);
  const clicked_normal_blocks = $derived(blockState.clicked_normal_blocks);

  // Derived reactive values - accessing the state values correctly
  let options = $derived(leading_blocks.map((b) => b.title));

  let clicked_options = $derived(
    options.filter((o) => clicked_normal_blocks.map((b) => b.title).includes(o))
  );

  let first_block_title = $derived(base_blocks[0]?.title || "");
  let second_block_title = $derived(base_blocks[1]?.title || "");

  let combination_participants = $derived(
    aggregate_combinations(participant_combinations)
  );

  let sorted_combinations = $derived(
    [...rendered_combinations].sort(
      (a, b) =>
        -(
          (combination_participants[a]?.length || 0) -
          (combination_participants[b]?.length || 0)
        )
    )
  );
  $effect(() => console.log(combinationState.rendered_combinations));

  let show_combination_participants = $derived(
    Object.keys(combination_content).reduce(
      (acc, cur) => {
        acc[cur] = false;
        return acc;
      },
      { empty: false }
    )
  );

  // State for tracking trigger times
  let update_base_block_trigger_times = $state(0);

  // Side effects
  $effect(() => {
    // if (first_block_title) {
    //   update_base_block(first_block_title, 0);
    // }
  });

  $effect(() => {
    // if (second_block_title) {
    //   update_base_block(second_block_title, 1);
    // }
  });

  function update_base_block(title: string, index: number) {
    // update_base_block_trigger_times += 1;
    // if (update_base_block_trigger_times <= 2) return;

    const block = leading_blocks.find((b) => b.title === title);
    if (block) {
      const current_blocks = [...base_blocks];
      current_blocks[index] = block;
      blockState.base_blocks = current_blocks;
      console.log("calling parent function");
      // updateParticipantColors(base_blocks);
      combination_controller.setParticipantColor(base_blocks, {});
    }
  }

  function aggregate_combinations(participant_combinations: {
    [key: string]: string;
  }) {
    let combination_participants: { [key: string]: string[] } = {};
    Object.entries(participant_combinations).forEach(
      ([participant, combination]) => {
        if (combination_participants[combination] === undefined) {
          combination_participants[combination] = [];
        }
        combination_participants[combination].push(participant);
      }
    );
    combination_participants["empty"] = [];
    all_participants.forEach((participant) => {
      if (participant_combinations[participant] === undefined) {
        combination_participants["empty"].push(participant);
      }
    });
    return combination_participants;
  }

  onMount(() => {
    // update_base_block(first_block_title, 0);
    // update_base_block(second_block_title, 1);
  });
</script>

<div class="combinations-container flex w-full grow flex-col gap-y-1">
  <div class="flex">
    <div class="px-1 underline">
      {leading_section_title}
    </div>
  </div>
  <div class="flex grow flex-col">
    <div
      class="relative z-[40] mb-[-0.5rem] mt-[-2.5rem] flex max-w-full select-none gap-x-[1.3rem] overflow-x-visible pl-12"
    >
      {#each options as option, index}
        {@const option_filled = sorted_combinations
          .map((c) => combination_content[c].map((b) => b.title))
          .flat()
          .includes(option)}
        {@const option_clicked = clicked_options.includes(option)}
        {@const abbr_length = 17}
        <div
          class="shortened-title vertical-title"
          style={`color: ${
            option_clicked ? "black" : "darkgray"
          }; text-decoration-line: ${option_filled ? "none" : "line-through"}`}
        >
          {option.slice(0, abbr_length) +
            (option.length > abbr_length ? "..." : "")}
        </div>
        <div
          class="full-title pointer-events-none absolute top-8 z-[999] hidden w-max bg-white px-2 text-base outline-1 outline-gray-200"
          style={`left: ${(index + 1) * 1.3}rem`}
        >
          {option}
        </div>
      {/each}
    </div>
    <div
      class="combinations-list flex h-1 grow snap-y flex-col gap-y-2 overflow-auto px-0.5 pr-[0.6rem] text-sm"
      style={`scrollbar-gutter: stable`}
    >
      {#each sorted_combinations as combination, index}
        {@const combination_titles = combination_content[combination].map(
          (b) => b.title
        )}
        {@const circle_filled = options.map((o) =>
          combination_titles.includes(o)
        )}
        {@const filled_circle_indices = circle_filled
          .map((c, i) => (c ? i : -1))
          .filter((i) => i !== -1)}
        <div
          role="button"
          tabindex={index}
          class="combination-container relative flex snap-center justify-between py-1 opacity-[15%] outline-2 outline-black transition-opacity hover:shadow-md hover:brightness-90"
          class:rendered={rendered_combinations.includes(combination)}
          class:highlighted={highlighted_combinations.includes(combination)}
          style={`background-color: ${combination_colors[combination]};`}
          on:click={(e) => {
            e.preventDefault();
            // This functionality is currently disabled
            // TODO: Re-implement highlighted combinations functionality if needed
          }}
          on:keyup={() => {}}
        >
          {#each options as option, index}
            <svg class="h-[1.3rem] w-[1.3rem]" viewBox="0 0 100 110"
              ><circle
                cx="50"
                cy="55"
                r="50"
                fill={circle_filled[index] ? "gray" : "white"}
                stroke-width="5"
              ></circle>
            </svg>
          {/each}
          <div class="absolute bottom-0 left-[101%] right-0 top-0">
            {combination_participants[combination].length}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .comparison-mode {
    @apply bg-green-100;
  }
  .shortened-title:hover + .full-title {
    @apply block;
  }
  .vertical-title {
    @apply rotate-[230deg];
    writing-mode: vertical-lr;
  }
  .rendered {
    @apply opacity-100;
  }
  .combinations-list {
    & .intro-activated {
      @apply !opacity-100;
    }
  }
  .highlighted {
    @apply outline;
  }
</style>
