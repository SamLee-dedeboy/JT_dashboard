<script lang="ts">
  import * as d3 from "d3";
  import Combinations from "./Combinations.svelte";
  import * as Utils from "../renderers/FlowRenderUtils";
  import * as Constants from "../constants";
  import introJs from "intro.js";
  import "intro.js/introjs.css";
  import { flowActions } from "../flow_store.svelte";
  import {
    participantState,
    blockState,
    combinationState,
    uiState,
    sectionState,
  } from "../flow_store.svelte";
  // import { createContextMenu, melt } from "@melt-ui/svelte";
  import type {
    tColumnMetadata,
    tDataset,
    tParticipantData,
    tPathData,
    tSectionMetadata,
    tBlock,
  } from "../types";
  import type { BlockAggregator } from "../renderers/BlockAggregator";
  import { onMount, tick } from "svelte";
  import { server_address } from "../constants";
  import SectionWrapper from "./SectionWrapper.svelte";
  import { combination_controller } from "../renderers/CombinationController";

  interface Props {
    data: tDataset;
    category_metadata: { [key: string]: string[] };
    block_aggregator: BlockAggregator;
  }

  let { data, category_metadata, block_aggregator }: Props = $props();

  let container = $state<HTMLElement>();
  let chat_response_audio = $state<HTMLAudioElement>();
  let intro_step = $state(0);
  let recorder = $state<any>(null);
  let is_recording = $state(false);
  let chunks = $state<any[]>([]);

  // Use $derived to get state values
  const all_participants: string[] = $derived(
    participantState.all_participants
  );
  const mentioned_participants: string[] = $derived(
    participantState.mentioned_participants
  );
  const participant_colors: { [key: string]: string } = $derived(
    participantState.participant_colors
  );
  const participant_combinations: { [key: string]: string } = $derived(
    participantState.participant_combinations
  );

  const base_blocks: tBlock[] = $derived(blockState.base_blocks);
  const leading_blocks: tBlock[] = $derived(blockState.leading_blocks);
  const leading_column: string = $derived(blockState.leading_column);
  const clicked_normal_blocks: tBlock[] = $derived(
    blockState.clicked_normal_blocks
  );
  const clicked_leading_blocks: tBlock[] = $derived(
    blockState.clicked_leading_blocks
  );
  const clicked_block: tBlock | null = $derived(blockState.clicked_block);
  const hovered_block: tBlock | undefined = $derived(blockState.hovered_block);

  const combination_colors: { [key: string]: string } = $derived(
    combinationState.combination_colors
  );
  const combination_content: {
    [key: string]: { id: string; title: string }[];
  } = $derived(combinationState.combination_content);
  const highlighted_combinations: string[] = $derived(
    combinationState.highlighted_combinations
  );
  const rendered_combinations: string[] = $derived(
    combinationState.rendered_combinations
  );

  const showing_introduction: boolean = $derived(uiState.showing_introduction);
  const view_mode: boolean = $derived(uiState.view_mode);
  const context_menu_open: any = $derived(uiState.context_menu_open);
  const context_menu_trigger: any = $derived(uiState.context_menu_trigger);
  const transcript_view: any = $derived(uiState.transcript_view);

  const category_options: { [key: string]: string[] } = $derived(
    sectionState.category_options
  );
  const sections: tSectionMetadata[] = $derived(sectionState.sections);

  // Create bindable local state that syncs with the store
  let section0 = $state(sections[0]);
  let section1 = $state(sections[1]);
  let section2 = $state(sections[2]);
  let section3 = $state(sections[3]);

  // Sync local state back to the store when sections change
  $effect(() => {
    const currentSections = sections;
    section0 = currentSections[0];
    section1 = currentSections[1];
    section2 = currentSections[2];
  });

  // Sync changes back to the store when local sections change
  $effect(() => {
    if (section0 && section1 && section2) {
      const currentSections = sections;
      if (
        currentSections[0] !== section0 ||
        currentSections[1] !== section1 ||
        currentSections[2] !== section2
      ) {
        const newSections = [...currentSections];
        newSections[0] = section0;
        newSections[1] = section1;
        newSections[2] = section2;
        sectionState.sections = newSections;
      }
    }
  });

  // listeners - convert reactive statements to effects
  let highlight_change_trigger_times = $state(0);

  $effect(() => {
    // Watch for changes in clicked_normal_blocks
    // if (!render_in_progress) {
    // handleBlockClicked(clicked_normal_blocks);
    // }
  });

  // function handleBlockClicked() {
  //   highlight_change_trigger_times += 1;
  //   if (highlight_change_trigger_times <= 1) {
  //     return;
  //   }
  //   render_paths();
  // }

  // $effect(() => {
  //   // Watch for changes in highlighted_combinations
  //   // handleHighlightCombinationChanged(highlighted_combinations);
  // });

  function handleHighlightCombinationChanged(
    highlighted_combinations: string[]
  ) {
    console.log("highlight combinations changed", highlighted_combinations);
    highlight_paths_by_combinations(highlighted_combinations);
  }

  let section_change_trigger_times = $state(0);

  // $effect(async () => {
  //   // Watch for changes in sections
  //   section_change_trigger_times += 1;
  //   if (section_change_trigger_times <= 2) {
  //     return;
  //   }
  //   console.log("section changed");
  //   await tick();
  //   render_paths();
  // });

  export function render_paths() {
    console.log("render paths called", container, sections);
    if (!container) return;

    const svgWidth = container.clientWidth;
    const svgHeight = container.clientHeight;

    const svg = d3
      .select("#sankey-svg")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    console.log(svg.node());

    const block_participants = Utils.block_participants_to_dict(
      block_aggregator.get_all_block_participants()
    );

    const filtered_column_orders = flatten_section_columns(
      sections.filter((section) => !section.hidden)
    );

    let sankey_paths: tPathData[] = [];
    if (false) {
      // if (comparison_mode) {
      sankey_paths = comparison_mode_paths(
        filtered_column_orders,
        block_participants,
        block_aggregator
      );
    } else {
      sankey_paths = normal_mode_paths(
        filtered_column_orders,
        clicked_normal_blocks,
        block_participants,
        block_aggregator
      );
    }
    console.log("paths: ", sankey_paths);
    const paths = svg
      .selectAll("path.sankey")
      .data(sankey_paths, (d: any) => d.id)
      .join("path")
      .attr("class", (d: tPathData) => d.class)
      .classed("dismiss-path", false)
      .classed("highlight-path", false)
      .classed("sankey", true)
      .attr("d", (d: tPathData) => d.path.toString())
      .attr("fill", (d: tPathData) => {
        return combination_colors[d.id];
      })
      .attr("opacity", 0.7)
      .raise()
      .on("click", function (e, d: tPathData) {
        e.preventDefault();
        d3.selectAll("path.sankey")
          .filter((_d: any) => _d.id === d.id)
          .raise();
      });
    const highlighted_participants = clicked_leading_blocks
      .map((b) => b.participants)
      .flat();
    console.log("highlight changed", highlighted_participants);
    if (highlighted_participants.length > 0) {
      highlight_paths_by_clicked_blocks(
        highlighted_participants,
        clicked_normal_blocks
      );
    }
  }

  function highlight_paths_by_clicked_blocks(
    leading_column_participants: string[],
    clicked_normal_blocks: tBlock[]
  ) {
    const clicked_block_participants = clicked_normal_blocks
      .map((b) => b.participants)
      .flat();
    const clicked_block_participant_intersection = Utils.intersection(
      clicked_normal_blocks.map((b) => b.participants)
    );
    const highlight_participants = leading_column_participants.filter(
      (pid) =>
        clicked_block_participants.length === 0 ||
        clicked_block_participant_intersection.includes(pid)
    );
    console.log(
      "highlight paths by clicked_blocks",
      leading_column_participants,
      clicked_normal_blocks,
      highlight_participants
    );
    const svg = d3.select("#sankey-svg");
    const paths = svg.selectAll("path.sankey");
    const clicked_columns = clicked_normal_blocks.map((b) => b.column_id);
    const clicked_categories = clicked_normal_blocks.map((b) => b.id);
    const highlight_paths = paths
      .classed("dismiss-path", false)
      .classed("semi-highlight-path", false)
      .classed("highlight-path", false)
      .each(function (d: tPathData) {
        const participants = d.participants;
        if (
          highlight_participants.filter((hp) => participants.includes(hp))
            .length === 0
        )
          return d3.select(this).classed("dismiss-path", true);
        let source_highlight = true;
        let target_highlight = true;
        if (clicked_columns.includes(d.source_column)) {
          source_highlight = clicked_categories.includes(d.source);
        }
        if (clicked_columns.includes(d.target_column)) {
          target_highlight = clicked_categories.includes(d.target);
        }
        if (source_highlight && target_highlight) {
          return d3.select(this).classed("highlight-path", true);
        } else {
          return d3.select(this).classed("semi-highlight-path", true);
        }
      });
    Utils.highlight_blocks_by_participants(highlight_participants);
  }

  function highlight_paths_by_combinations(highlight_combinations: string[]) {
    console.log("highlight paths by combinations", highlight_combinations);
    const svg = d3.select("#sankey-svg");
    const paths = svg.selectAll("path.sankey");
    if (highlight_combinations.length === 0) {
      paths.classed("dismiss-path", false).classed("highlight-path", false);
      return;
    }
    const clicked_column = clicked_block?.column_id;
    const clicked_category = clicked_block?.id;
    paths
      .classed("dismiss-path", true)
      .classed("highlight-path", false)
      .filter((d: tPathData) => {
        if (!highlight_combinations.includes(d.id)) return false;
        if (
          clicked_column !== d.source_column &&
          clicked_column !== d.target_column
        )
          return true;
        if (clicked_column === d.source_column && clicked_category !== d.source)
          return false;
        if (clicked_column === d.target_column && clicked_category !== d.target)
          return false;
        return true;
      })
      .classed("dismiss-path", false)
      .classed("highlight-path", true);
    if (clicked_block)
      Utils.highlight_blocks_by_combinations(
        highlight_combinations,
        clicked_block
      );
  }

  function comparison_mode_paths(
    filtered_column_orders: tColumnMetadata[],
    block_participants: { [key: string]: string[] },
    block_aggregator: BlockAggregator
  ) {
    let sankey_paths: tPathData[] = [];
    for (let i = 0; i < filtered_column_orders.length - 1; i++) {
      const src_blocks_ids = block_aggregator
        .get_blocks(
          filtered_column_orders[i].section_id,
          filtered_column_orders[i].id
        )
        .map((b) => b.id);
      const dst_blocks_ids = block_aggregator
        .get_blocks(
          filtered_column_orders[i + 1].section_id,
          filtered_column_orders[i + 1].id
        )
        .map((b) => b.id);
      if (i === 0) {
        const new_paths = Utils.first_column_paths(
          "#sankey-svg",
          participant_combinations,
          block_participants,
          base_blocks.map((b) => b.id),
          dst_blocks_ids,
          filtered_column_orders[i].column_id_prefix,
          filtered_column_orders[i + 1].column_id_prefix
        );
        sankey_paths = sankey_paths.concat(new_paths);
      } else {
        const new_paths = Utils.paths_between_columns(
          "#sankey-svg",
          participant_combinations as any,
          block_participants as any,
          src_blocks_ids,
          dst_blocks_ids,
          filtered_column_orders[i].column_id_prefix,
          filtered_column_orders[i + 1].column_id_prefix
        );
        sankey_paths = sankey_paths.concat(new_paths);
      }
    }
    return sankey_paths;
  }

  function normal_mode_paths(
    filtered_column_orders: tColumnMetadata[],
    passthrough_blocks: tBlock[],
    block_participants: { [key: string]: string[] },
    block_aggregator: BlockAggregator
  ) {
    const showed_column_ids = filtered_column_orders.map((c) => c.id);
    const passthrough_block_ids = passthrough_blocks
      .filter((b) =>
        showed_column_ids.includes(
          Constants.column_to_participant_data_key[b.column_id]
        )
      )
      .map((b) => b.id);

    // block combinations
    let block_combinations: { [key: string]: { [key: string]: string[] } } = {};
    Object.entries(block_participants).forEach(([block_id, participants]) => {
      block_combinations[block_id] = {};
      const _participant_combinations: [string, string | undefined][] =
        participants.map((participant) => [
          participant,
          participant_combinations[participant],
        ]);
      _participant_combinations.forEach(([participant, combination]) => {
        if (!combination) return;
        if (!block_combinations[block_id][combination])
          block_combinations[block_id][combination] = [];
        block_combinations[block_id][combination].push(participant);
      });
    });
    // generate sankey paths by connected components
    let sankey_paths: tPathData[] = [];
    const connected_components = Utils.connected_components(
      filtered_column_orders,
      passthrough_blocks
    );
    console.log({ filtered_column_orders, passthrough_blocks });
    let all_pass_through_combinations: Set<string> = new Set();
    connected_components.forEach((component: tColumnMetadata[]) => {
      const all_column_block_ids = component
        .map((column_order) =>
          block_aggregator.get_blocks(column_order.section_id, column_order.id)
        )
        .map((blocks) => blocks.map((b) => b.id));
      let all_combinations: string[][] = [];
      all_column_block_ids.forEach((block_ids) => {
        block_ids = block_ids.filter((id) =>
          passthrough_block_ids.includes(id)
        );
        if (block_ids.length === 0) return;
        const combinations = block_ids
          .map((id) => Object.keys(block_combinations[id]))
          .flat();
        all_combinations.push(combinations);
      });
      const passthrough_combinations = Utils.intersection(all_combinations);
      passthrough_combinations.forEach((c) =>
        all_pass_through_combinations.add(c)
      );
      console.log({ component, all_combinations, passthrough_combinations });
      for (let i = 0; i < component.length - 1; i++) {
        const src_blocks_ids = block_aggregator
          .get_blocks(component[i].section_id, component[i].id)
          .map((b) => b.id)
          .filter((id) => passthrough_block_ids.includes(id));
        const dst_blocks_ids = block_aggregator
          .get_blocks(component[i + 1].section_id, component[i + 1].id)
          .map((b) => b.id)
          .filter((id) => passthrough_block_ids.includes(id));
        const new_paths = Utils.paths_between_columns(
          "#sankey-svg",
          block_combinations,
          passthrough_combinations,
          src_blocks_ids,
          dst_blocks_ids,
          component[i].column_id_prefix,
          component[i + 1].column_id_prefix
        );
        sankey_paths = sankey_paths.concat(new_paths);
      }
    });
    combinationState.rendered_combinations = Array.from(
      new Set(sankey_paths.map((p) => p.id))
    );
    console.log(
      "InterviewFlow.svelte:458",
      combinationState.rendered_combinations
    );
    combination_controller.setParticipantColor(
      rendered_combinations,
      participant_combinations
    );
    return sankey_paths;
  }

  function goToTranscript() {
    uiState.context_menu_open = false;
  }

  function flatten_section_columns(sections: tSectionMetadata[]) {
    let column_orders: tColumnMetadata[] = [];
    sections.forEach((section) => {
      column_orders = column_orders.concat(
        section.columns.filter((c) => !c.hidden)
      );
    });
    return column_orders;
  }

  function setTour() {
    // we will clear the clicked blocks during tutorial and set it back after tutorial
    const clicked_blocks_before_tutorial = clicked_normal_blocks;
    const tour = introJs()
      .setOptions({
        tooltipClass: "customTooltip",
        showStepNumbers: true,
        exitOnOverlayClick: false,
        skipLabel: "Skip",
        steps: [
          {
            title: "Welcome!",
            intro: `Via this interactive interface, you can explore the participants' responses to interview questions.<br>
            Let's walk through the interface step by step. <br>
            Click 'Next' to continue.`,
          },
          {
            title: "What's in this interface?",
            element: document.querySelector(".flow-container") as HTMLElement,
            intro: `
            This interface visualizes the results of three questions about Delta salinity management asked in our public interviews: <br>
              <span class="intro-highlight intro-bg-gray"> Drivers of Change</span>,
              <span class="intro-highlight intro-bg-gray"> Future Management Strategies</span>, and <br>
              <span class="intro-highlight intro-bg-gray"> Decision Making Process</span>. <br>
              Each block you see is a <span class="intro-highlight">category</span> of participant responses that is automatically extracted and categorized by AI.
              Next, we go over each section in more detail. <br>
              Click 'Next' to continue. <br>
              <span class="intro-highlight"> Tip: </span> You can toggle on/off each column. `,
          },
          // ...existing steps...
        ],
      })
      .onchange(() => {
        intro_step += 1;
      })
      .onbeforechange(async () => {
        if (intro_step == 0) {
          // reset the interface
          blockState.clicked_normal_blocks = [];
        }
        if (intro_step === 4) {
          d3.selectAll(".combination-container").classed(
            "intro-activated",
            true
          );
        }
        if (intro_step === 4) {
          const first_driver_block = block_aggregator.get_blocks(
            sections[0].id,
            sections[0].columns[0].id
          )[0];
          const first_strategy_block = block_aggregator.get_blocks(
            sections[1].id,
            sections[1].columns[0].id
          )[0];
          blockState.clicked_normal_blocks = [
            first_driver_block,
            first_strategy_block,
          ];
        }
        return true;
      })
      .onbeforeexit(() => {
        d3.selectAll(".combination-container").classed(
          "intro-activated",
          false
        );
        intro_step = 0;
        if (clicked_normal_blocks.length > 0) {
          blockState.clicked_normal_blocks = clicked_blocks_before_tutorial;
        }
        return true;
      });
    return tour;
  }

  onMount(() => {
    flowActions.setInterviewFlowRef({ render_paths });
    // add_intro_pseudo_block();
    blockState.clicked_normal_blocks = [];
    render_paths();
    document
      .querySelector(".flow-container")
      ?.addEventListener("click", (e) => {
        if (!e.defaultPrevented) {
          console.log("click on flow container");
          return;
          d3.selectAll(".block-container")
            .classed("highlight-block", false)
            .classed("dismiss-block", false);
          d3.selectAll("path")
            .classed("highlight-path", false)
            .classed("dismiss-path", false);
          blockState.clicked_normal_blocks = [];
          blockState.clicked_block = null;
          uiState.context_menu_open = false;
        }
      });
    // setTour().start();
  });
</script>

<div class="upper-page flex flex-1 h-full w-full bg-gray-50">
  <div class="control-panel flex w-[28rem] flex-col">
    <!-- <span class="flex items-center justify-center font-serif text-lg font-bold">
      JT Participant Transcripts
    </span> -->
    <!-- <div
      role="button"
      tabindex="0"
      class="mb-4 flex justify-center rounded-md bg-green-200 px-1 py-0.5 text-center text-[#6b7280] shadow-md"
      onclick={() => {
        // setTour().start()
      }}
      onkeyup={() => {}}
    >
      Tutorial
    </div> -->
    <div class="overview-panel w-full"></div>
    <div class="statistics-panel flex h-1 grow flex-col">
      <div class="flex grow flex-col gap-8">
        <div
          class="tutorial text flex flex-col p-3 mx-2 gap-4 divide-y divide-dashed text-white"
        >
          <div>
            <div>We mainly asked three questions in the interview:</div>
            <ol class="list-decimal list-outside pl-4">
              <li>
                What should Future Salinity Management Strategies focus on?
              </li>
              <li>What are the Drivers of Change?</li>
              <li>Is the current decision making Fair?</li>
            </ol>
            <div class="my-2">
              Answer the questions yourself by clicking the blocks and see how
              many participants agree with you!
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div>How to read the flow diagram:</div>
            <div>Each block represents a category of public opinion.</div>
            <div>
              Connected blocks represent public opinion from the same group of
              people.
            </div>
            <div>
              Color of connections represent different groups of people.
              <br />
              These groups are defined by the participants' responses to
              <span class="underline">
                "What should be the Future Salinity Management Strategies?".
              </span>
            </div>
          </div>
        </div>
        <Combinations
          {block_aggregator}
          leading_section_title={Constants.column_id_to_title[leading_column]}
        ></Combinations>
      </div>
    </div>
  </div>
  <div
    bind:this={container}
    class="flow-container relative flex grow justify-between gap-x-2"
  >
    {#if sections.length > 0}
      {@const total_columns = sections.reduce((acc, section) => {
        return acc + section.columns.length;
      }, 0)}
      {@const total_sections = sections.length}
      <!-- <div class="first-two-sections flex justify-around gap-x-2">
        <SectionWrapper
          bind:section={section0}
          index={0}
          {total_sections}
          {total_columns}
          {data}
          {category_metadata}
          {block_aggregator}
        ></SectionWrapper>
        <SectionWrapper
          bind:section={section1}
          index={1}
          {total_sections}
          {total_columns}
          {data}
          {category_metadata}
          {block_aggregator}
        ></SectionWrapper>
      </div> -->
      <SectionWrapper
        bind:section={section0}
        index={0}
        {total_sections}
        {total_columns}
        {data}
        {category_metadata}
        {block_aggregator}
      ></SectionWrapper>
      <SectionWrapper
        bind:section={section1}
        index={1}
        {total_sections}
        {total_columns}
        {data}
        {category_metadata}
        {block_aggregator}
      ></SectionWrapper>
      <SectionWrapper
        bind:section={section2}
        index={2}
        {total_sections}
        {total_columns}
        {data}
        {category_metadata}
        {block_aggregator}
      ></SectionWrapper>
      <SectionWrapper
        bind:section={section3}
        index={3}
        {total_sections}
        {total_columns}
        {data}
        {category_metadata}
        {block_aggregator}
      ></SectionWrapper>
    {/if}
    <svg id="sankey-svg" class="sankey-svg"></svg>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .upper-page {
    background-color: var(--surface-elevated);
  }
  .control-panel span {
    color: var(--text-primary);
  }
  .tutorial {
    background-color: var(--bg-page);
    outline: 2px solid var(--brand-primary);
    border-radius: 4px;
  }
  .sankey-svg {
    @apply absolute bottom-0 left-0 right-0 top-0;
    & .center {
      opacity: 0;
      stroke-width: 1;
      /* stroke: black; */
      /* stroke-dasharray: 4; */
      z-index: 2;
      fill: var(--text-primary);
    }
    & .sankey {
      filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.2));
      transition: all 0.3s;
    }
    & .dismiss-path {
      opacity: 0.01;
      pointer-events: none;
      fill: var(--neutral-100);
    }
    & .semi-highlight-path {
      opacity: 0.1;
      filter: none;
    }
    & .highlight-path.flow {
      opacity: 0.8;
      stroke-width: 1;
      /* stroke: gray; */
    }
    & .highlight-path.center {
      opacity: 1;
    }
  }

  .flow-container {
    font-family: var(--font-family-body);
    /* & .section-container {
      @apply shadow-[0px_10px_10px_-5px_rgba(0,0,0,0.3)];
    } */
    /* & .highlight-block {
      outline: 2px solid #aaaaaa;
      box-shadow: 0px 0px 2px #aaaaaa;
      border-radius: 0px;
    } */
    & .dismiss-block {
      opacity: 0.3;
      @apply pointer-events-none !shadow-none;
    }
    & .leading_section .section-header {
      background-color: var(--surface-interactive) !important;
      color: var(--text-primary) !important;
    }
    /* & .leading_section .icon:hover {
      @apply !bg-amber-400;
    } */
  }
  .show-icon-container:hover .hidden-section-title {
    @apply block;
  }
  :global(.introjs-tooltip) {
    max-width: 600px !important;
    width: 600px !important;
  }
  :global(.customTooltip) {
    & * {
      @apply !font-mono;
    }
  }
  :global(.intro-highlight) {
    @apply font-semibold;
  }
  :global(.intro-bg-gray) {
    @apply rounded px-0.5;
    background-color: var(--neutral-200);
  }
  :global(.intro-svg) {
    @apply inline h-[1.3rem] w-[1.3rem];
  }
  :global(.introjs-skipbutton) {
    font-size: 0.9rem !important;
    font-weight: unset !important;
    line-height: 1rem !important;
    right: 1rem !important;
    top: 0.5rem !important;
    width: unset !important;
    height: unset !important;
    padding: 0.3rem 0.2rem !important;
    border-radius: 3% !important;
    outline: 1px solid var(--border-subtle) !important;
    background: var(--neutral-100) !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace !important;
  }
</style>
