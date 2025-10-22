import type { tBlock, tSectionMetadata } from "./types";
import * as Columns from "./constants";
import { render } from "svelte/server";
let interviewFlowComponent: any = $state(null);

export const flowActions = {
  setInterviewFlowRef(component: any) {
    interviewFlowComponent = component;
  },
  
  triggerRenderPaths() {
    if (interviewFlowComponent?.render_paths) {
      interviewFlowComponent.render_paths();
    }
  }
};
// Participant-related state
let _all_participants = $state([] as string[]);
let _mentioned_participants = $state([] as string[]);
let _participant_colors = $state({} as { [key: string]: string });
let _participant_combinations = $state({} as { [key: string]: string });

export const participantState = {
  get all_participants() {
    return _all_participants;
  },
  set all_participants(participants: string[]) {
    _all_participants = participants;
  },
  get mentioned_participants() {
    return _mentioned_participants;
  },
  set mentioned_participants(participants: string[]) {
    _mentioned_participants = participants;
  },
  get participant_colors() {
    return _participant_colors;
  },
  set participant_colors(colors: { [key: string]: string }) {
    _participant_colors = colors;
  },
  get participant_combinations() {
    return _participant_combinations;
  },
  set participant_combinations(combinations: { [key: string]: string }) {
    _participant_combinations = combinations;
  }
};

// Block-related state
let _base_blocks = $state([] as tBlock[]);
let _leading_blocks = $state([] as tBlock[]);
let _leading_column = $state("");
let _clicked_normal_blocks = $state([] as tBlock[]);
let _clicked_leading_blocks = $state([] as tBlock[]);
let _clicked_block = $state(null as tBlock | null);
let _hovered_block = $state(undefined as tBlock | undefined);

export const blockState = {
  get base_blocks() {
    return _base_blocks;
  },
  set base_blocks(blocks: tBlock[]) {
    _base_blocks = blocks;
  },
  get leading_blocks() {
    return _leading_blocks;
  },
  set leading_blocks(blocks: tBlock[]) {
    _leading_blocks = blocks;
  },
  get leading_column() {
    return _leading_column;
  },
  set leading_column(column_id: string) {
    _leading_column = column_id;
  },
  get clicked_normal_blocks() {
    return _clicked_normal_blocks;
  },
  set clicked_normal_blocks(blocks: tBlock[]) {
    _clicked_normal_blocks = JSON.parse(JSON.stringify(blocks))
    flowActions.triggerRenderPaths();
  },
  get clicked_leading_blocks() {
    return _clicked_leading_blocks;
  },
  set clicked_leading_blocks(blocks: tBlock[]) {
    _clicked_leading_blocks = blocks;
  },
  get clicked_block() {
    return _clicked_block;
  },
  set clicked_block(block: tBlock | null) {
    _clicked_block = block;
  },
  get hovered_block() {
    return _hovered_block;
  },
  set hovered_block(block: tBlock | undefined) {
    _hovered_block = block;
  }
};

// Combination-related state
let _combination_colors = $state({} as { [key: string]: string });
let _combination_content = $state({} as { [key: string]: { id: string; title: string }[] });
let _highlighted_combinations = $state([] as string[]);
let _rendered_combinations = $state([] as string[]);

export const combinationState = {
  get combination_colors() {
    return _combination_colors;
  },
  set combination_colors(colors: { [key: string]: string }) {
    _combination_colors = colors;
  },
  get combination_content() {
    return _combination_content;
  },
  set combination_content(content: { [key: string]: { id: string; title: string }[] }) {
    _combination_content = content;
  },
  get highlighted_combinations() {
    return _highlighted_combinations;
  },
  set highlighted_combinations(combinations: string[]) {
    _highlighted_combinations = combinations;
  },
  get rendered_combinations() {
    return _rendered_combinations;
  },
  set rendered_combinations(combinations: string[]) {
    _rendered_combinations = combinations;
  }
};

// UI-related state
let _showing_introduction = $state(true);
let _view_mode = $state(true);
let _context_menu_open = $state(false as any);
let _context_menu_trigger = $state(null as any);
let _transcript_view = $state(null as any);

export const uiState = {
  get showing_introduction() {
    return _showing_introduction;
  },
  set showing_introduction(value: boolean) {
    _showing_introduction = value;
  },
  get view_mode() {
    return _view_mode;
  },
  set view_mode(value: boolean) {
    _view_mode = value;
  },
  get context_menu_open() {
    return _context_menu_open;
  },
  set context_menu_open(value: any) {
    _context_menu_open = value;
  },
  get context_menu_trigger() {
    return _context_menu_trigger;
  },
  set context_menu_trigger(value: any) {
    _context_menu_trigger = value;
  },
  get transcript_view() {
    return _transcript_view;
  },
  set transcript_view(value: any) {
    _transcript_view = value;
  }
};

// Section and category-related state
let _category_options = $state({} as { [key: string]: string[] });
let _sections = $state([
  {
    id: "future_management",
    title: "What should be the Future Salinity Management Strategies?",
    hidden: false,
    columns: [
      {
        id: "strategies",
        title: "Strategies",
        section_id: "future_management",
        column_id_prefix: Columns.strategy_column_id,
        value_process_func: Columns.category_process_func,
        type: "one",
        hidden: false,
      },
    ],
  },
  {
    id: "drivers_of_change",
    title: "What are the Drivers of Change?",
    hidden: false,
    columns: [
      {
        id: "factors",
        title: "Factors",
        section_id: "drivers_of_change",
        column_id_prefix: Columns.factor_column_id,
        value_process_func: Columns.category_process_func,
        type: "many",
        hidden: false,
      },
    ],
  },
  {
    id: "decision_making",
    title: "Is the current decision making Fair?",
    hidden: false,
    columns: [
      {
        id: "fairness",
        title: "Fair?",
        section_id: "decision_making",
        column_id_prefix: Columns.fairness_column_id,
        value_process_func: (d) => d.toLowerCase(),
        type: "one",
        hidden: false,
      },
      {
        id: "represented_groups",
        title: "Represented Groups",
        section_id: "decision_making",
        column_id_prefix: Columns.represented_column_id,
        value_process_func: Columns.category_process_func,
        type: "many",
        hidden: false,
      },
      {
        id: "not_represented_groups",
        title: "Overlooked Groups",
        section_id: "decision_making",
        column_id_prefix: Columns.not_represented_column_id,
        value_process_func: Columns.category_process_func,
        type: "many",
        hidden: false,
      },
    ],
  },
] as tSectionMetadata[]);

export const sectionState = {
  get category_options() {
    return _category_options;
  },
  set category_options(options: { [key: string]: string[] }) {
    _category_options = options;
  },
  get sections() {
    return _sections;
  },
  set sections(s: tSectionMetadata[]) {
    _sections = s;
  }
};

// Utility function for intersection (kept as is)
function intersection(list_of_arrays: any[][]) {
  if (list_of_arrays.length === 0) return [] as any[];
  let intersection: any[] = list_of_arrays[0];
  list_of_arrays.forEach((array, i) => {
    intersection = array.filter((value) => intersection.includes(value));
  });
  return intersection;
}
