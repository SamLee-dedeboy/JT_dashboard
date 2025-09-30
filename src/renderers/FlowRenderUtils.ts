import * as d3 from "d3";
import type {
  tBlock,
  tPathData,
  tLink,
  tDecisionMakingBlockContent,
  tColumnMetadata,
} from "./types";

type Coordinate = {
  x: number;
  y: number;
};

export function update_blocks(original_blocks: tBlock[], new_block: tBlock) {
  const original_block_ids = original_blocks.map((d) => d.id);
  if (original_block_ids.includes(new_block.id)) {
    const index = original_block_ids.indexOf(new_block.id);
    const original_participants = original_blocks[index].participants;
    original_blocks[index].participants = original_participants.concat(
      new_block.participants,
    );
    original_blocks[index].content = (
      original_blocks[index].content || []
    ).concat(new_block.content || []);
  } else {
    original_blocks.push(new_block);
  }
  return original_blocks;
}

export function highlight_blocks_by_participants(
  highlight_participants: string[],
) {
  const blocks = [...document.querySelectorAll(".block-container")].filter(
    (ele) => !ele.classList.contains("leading"),
  );
  blocks.forEach((block) => {
    block.classList.remove("highlight-block");
    block.classList.remove("dismiss-block");
    const block_data_str = String(block.dataset.json);
    if (block_data_str !== "undefined") {
      const block_data = JSON.parse(block_data_str);
      const block_participants = block_data.participants;
      if (
        block_participants.some((participant) =>
          highlight_participants.includes(participant),
        )
      ) {
        block.classList.remove("dismiss-block");
        block.classList.add("highlight-block");
      } else {
        block.classList.remove("highlight-block");
        block.classList.add("dismiss-block");
      }
    }
  });
}
export function highlight_blocks_by_combinations(
  combinations: string[] | null,
  clicked_block: tBlock,
) {
  const blocks = document.querySelectorAll(".block-element");
  blocks.forEach((block) => {
    block.classList.remove("highlight-block");
    block.classList.remove("dismiss-block");
    if (!combinations) return;
    const block_data_str = String(block.dataset.json);
    if (block_data_str !== "undefined") {
      const block_data = JSON.parse(block_data_str);
      const block_combinations = block_data.combinations;
      const column = block_data.column;
      // same column, not clicked block
      if (column === clicked_block.column_id && block.id !== clicked_block.id) {
        block.classList.remove("highlight-block");
        block.classList.add("dismiss-block");
        return;
      }
      // other blocks
      if (
        block_combinations.some((combination) =>
          combinations.includes(combination),
        )
      ) {
        block.classList.remove("dismiss-block");
        block.classList.add("highlight-block");
      } else {
        block.classList.remove("highlight-block");
        block.classList.add("dismiss-block");
      }
    }
  });
}

export function aggregate_blocks(
  categories: string[],
  category_participants: { [key: string]: string[] },
  category_content: tDecisionMakingBlockContent,
  column_id: string,
  category_process_func: any,
) {
  let blocks: tBlock[] = [];
  categories.forEach((category) => {
    const original_category = category;
    category = category_process_func(category);
    const participants = [
      ...new Set<string>(category_participants[column_id + category]),
    ];
    update_blocks(blocks, {
      id: column_id + category,
      column_id: column_id,
      title: original_category,
      participants: participants,
      content:
        category_content[column_id + category]?.map(
          (participant_categories) => [
            participant_categories.participant,
            participant_categories.name,
          ],
        ) || [],
    });
  });
  blocks = blocks.sort((a, b) => {
    return (
      (b.participants.length || 0) - (a.participants.length || 0) ||
      a.title.localeCompare(b.title)
    );
  });
  return blocks;
}

export function generate_flow(
  source_start: Coordinate,
  target_end: Coordinate,
  source_height: number,
  target_height: number,
) {
  let path = d3.path();
  const mid_x = (source_start.x + target_end.x) / 2;
  const vertical_offset = 0;
  path.moveTo(source_start.x, source_start.y + vertical_offset);
  path.bezierCurveTo(
    mid_x,
    source_start.y + vertical_offset,
    mid_x,
    target_end.y + vertical_offset,
    target_end.x,
    target_end.y + vertical_offset,
  );
  path.lineTo(target_end.x, target_end.y + target_height - vertical_offset);
  path.bezierCurveTo(
    mid_x,
    target_end.y + target_height - vertical_offset,
    mid_x,
    source_start.y + source_height - vertical_offset,
    source_start.x,
    source_start.y + source_height - vertical_offset,
  );
  path.lineTo(source_start.x, source_start.y);
  path.closePath();
  return path;
}

export function block_participants_to_dict(
  block_participant_list: [string, string[]][],
) {
  let res: { [key: string]: string[] } = {};
  block_participant_list.forEach((block) => {
    res[block[0]] = block[1];
  });
  return res;
}

export function compute_block_offset(
  block_id: string,
  combination_offset: [number, number],
  svg_bbox: { x: number; y: number },
  isStart: boolean,
) {
  const block_position = d3
    .select(`#${block_id}`)
    .node()
    .getBoundingClientRect();
  const offset = block_position.height * combination_offset[0];
  const height =
    block_position.height * (combination_offset[1] - combination_offset[0]);
  const pos = {
    x: block_position.x + (isStart ? 1 : 0) * block_position.width - svg_bbox.x,
    y: block_position.y + offset - svg_bbox.y,
  };
  // console.log("block_offset_ratios:", block_id, combination, pos, height);
  return { pos, height };
}

export function update_block_totals(block_totals: any, blocks: tBlock[]) {
  blocks.forEach((block) => {
    const block_id = block.id;
    block_totals[block_id] = block.participants.length;
  });
  return block_totals;
}

export function _addLink(
  links,
  source: string,
  target: string,
  participant: string,
) {
  for (let i = 0; i < links.length; i++) {
    if (links[i].source === source && links[i].target === target) {
      links[i].value = 1;
      return;
    }
  }
  links.push({
    source: source,
    target: target,
    value: 1,
    participant: participant,
  });
  return links;
}
export function addLink(
  links: tLink[],
  source: string,
  target: string,
  source_column: string,
  target_column: string,
  combination: string,
  participants: string[],
) {
  for (let i = 0; i < links.length; i++) {
    if (
      links[i].source === source &&
      links[i].target === target &&
      links[i].combination === combination
    ) {
      links[i].value += 1;
      return;
    }
  }
  links.push({
    source: source,
    target: target,
    source_column: source_column,
    target_column: target_column,
    value: 1,
    combination: combination,
    participants: participants,
  });
  return links;
}

export function generate_paths(
  svgId: string,
  links: tLink[],
  block_combinations: { [key: string]: { [key: string]: string[] } },
) {
  const svg = d3.select(svgId);
  const svg_bbox = svg.node().getBoundingClientRect();
  let paths: tPathData[] = [];
  const block_offset_ratios = _block_offset_ratios(block_combinations);
  // console.log({ block_offset_ratios });
  // let previous_id = "rect-unfair-BB";
  // links = links.filter((l) => l.source === "category-residents");
  // console.log({ links });
  links.forEach((link) => {
    // source
    const source_block_combination_offset =
      block_offset_ratios[link.source][link.combination];
    const source_computation = compute_block_offset(
      link.source,
      source_block_combination_offset,
      svg_bbox,
      true,
    );
    const source_end = source_computation.pos;
    const source_height = source_computation.height;
    // target
    const target_block_combination_offset =
      block_offset_ratios[link.target][link.combination];
    const target_computation = compute_block_offset(
      link.target,
      target_block_combination_offset,
      svg_bbox,
      false,
    );
    const target_start = target_computation.pos;
    const target_height = target_computation.height;
    // render path
    let path = generate_flow(
      source_end,
      target_start,
      source_height,
      target_height,
    );
    paths.push({
      // id: link.participant,
      id: link.combination,
      participants: link.participants,
      source: link.source,
      target: link.target,
      source_column: link.source_column,
      target_column: link.target_column,
      class: "flow",
      path: path,
    });
    // const center_path = generate_center_path(
    //   source_end,
    //   source_height,
    //   target_start,
    //   target_height,
    //   link.source.startsWith("participant-"),
    // );
    // paths.push({
    //   id: link.participant,
    //   class: "center",
    //   path: center_path,
    // });
  });
  return paths;
}

function _block_offset_ratios(block_combinations: {
  [key: string]: { [key: string]: string[] };
}) {
  let block_offset_ratios: {
    [key: string]: { [key: string]: [number, number] };
  } = {};
  Object.keys(block_combinations).forEach((block_id) => {
    block_offset_ratios[block_id] = {};
    const combinations = block_combinations[block_id];
    // total participants
    let total_participants = 0;
    Object.values(combinations).forEach((participants) => {
      total_participants += participants.length;
    });
    // ratios
    let accumulative_ratio = 0;
    Object.entries(combinations).forEach(([combination, participants]) => {
      const new_ratio = participants.length / total_participants;
      block_offset_ratios[block_id][combination] = [
        accumulative_ratio,
        accumulative_ratio + new_ratio,
      ];
      accumulative_ratio += new_ratio;
    });
  });
  return block_offset_ratios;
}

function generate_center_path(
  source_end,
  source_height,
  target_start,
  target_height,
  target_only,
) {
  let center_path = d3.path();
  const len = 2;
  const inner_offset = 1.5;
  const horizontal_offset = 2;
  if (!target_only) {
    // make source rectangle
    center_path.moveTo(
      source_end.x + horizontal_offset,
      source_end.y - source_height / 2 + inner_offset,
    );
    center_path.lineTo(
      source_end.x + horizontal_offset + len,
      source_end.y - source_height / 2 + inner_offset,
    );
    center_path.lineTo(
      source_end.x + horizontal_offset + len,
      source_end.y + source_height / 2 - inner_offset,
    );
    center_path.lineTo(
      source_end.x + horizontal_offset,
      source_end.y + source_height / 2 - inner_offset,
    );
    center_path.closePath();
  }
  // make target rectangle
  center_path.moveTo(
    target_start.x - len - horizontal_offset,
    target_start.y - target_height / 2 + inner_offset,
  );
  center_path.lineTo(
    target_start.x - horizontal_offset,
    target_start.y - target_height / 2 + inner_offset,
  );
  center_path.lineTo(
    target_start.x - horizontal_offset,
    target_start.y + target_height / 2 - inner_offset,
  );
  center_path.lineTo(
    target_start.x - len - horizontal_offset,
    target_start.y + target_height / 2 - inner_offset,
  );
  center_path.lineTo(
    target_start.x - len - horizontal_offset,
    target_start.y - target_height / 2 + inner_offset,
  );
  center_path.closePath();
  // center_path.lineTo(target_start.x - 1, target_start.y);
  return center_path;
}

export function paths_between_columns(
  svgId: string,
  block_combinations: { [key: string]: { [key: string]: string[] } },
  passthrough_combinations: string[],
  src_block_ids: string[],
  dst_block_ids: string[],
  src_column_id_prefix: string,
  dst_column_id_prefix: string,
) {
  let links: tLink[] = [];

  // connect blocks
  src_block_ids.forEach((src_block_id) => {
    const src_block_combinations = Object.keys(
      block_combinations[src_block_id],
    ).filter((value) => passthrough_combinations.includes(value));
    dst_block_ids.forEach((dst_block_id) => {
      const dst_block_combinations = Object.keys(
        block_combinations[dst_block_id],
      ).filter((value) => passthrough_combinations.includes(value));
      const src_dst_intersect_combinations = src_block_combinations.filter(
        (value) => dst_block_combinations.includes(value),
      );
      src_dst_intersect_combinations.forEach((combination) => {
        const intersect_src_block_participants =
          block_combinations[src_block_id][combination];
        const intersect_dst_block_participants =
          block_combinations[dst_block_id][combination];
        const intersect_participants = intersect_src_block_participants.filter(
          (p) => intersect_dst_block_participants.includes(p),
        );
        addLink(
          links,
          src_block_id,
          dst_block_id,
          src_column_id_prefix,
          dst_column_id_prefix,
          combination,
          intersect_participants,
        );
      });
    });
  });
  // console.log({ links });
  return generate_paths(svgId, links, block_combinations);
}

export function first_column_paths(
  svgId: string,
  participant_to_combination: { [key: string]: string },
  block_participants: { [key: string]: string[] },
  src_block_ids: string[],
  dst_block_ids: string[],
  src_column_id_prefix: string,
  dst_column_id_prefix: string,
) {
  const combinations = new Set(Object.values(participant_to_combination));
  if (combinations.size === src_block_ids.length) {
    return paths_between_columns(
      svgId,
      participant_to_combination,
      block_participants,
      src_block_ids,
      dst_block_ids,
      src_column_id_prefix,
      dst_column_id_prefix,
    );
  }
  // block combinations
  let block_combinations: { [key: string]: { [key: string]: string[] } } = {};
  Object.entries(block_participants).forEach(([block_id, participants]) => {
    if (!src_block_ids.includes(block_id) && !dst_block_ids.includes(block_id))
      return;
    block_combinations[block_id] = {};
    const participant_combinations: [string, string | undefined][] =
      participants.map((participant) => [
        participant,
        participant_to_combination[participant],
      ]);
    participant_combinations.forEach(([participant, combination]) => {
      if (!combination) return;
      if (!block_combinations[block_id][combination])
        block_combinations[block_id][combination] = [];
      block_combinations[block_id][combination].push(participant);
    });
  });

  // links
  let links: tLink[] = [];
  src_block_ids.forEach((src_block_id) => {
    const src_block_combinations = Object.keys(
      block_combinations[src_block_id],
    );
    dst_block_ids.forEach((dst_block_id) => {
      const dst_block_combinations = Object.keys(
        block_combinations[dst_block_id],
      );
      const intersect_combinations = src_block_combinations.filter((value) =>
        dst_block_combinations.includes(value),
      );
      intersect_combinations.forEach((combination) => {
        const intersect_src_block_participants =
          block_combinations[src_block_id][combination];
        const intersect_dst_block_participants =
          block_combinations[dst_block_id][combination];
        const intersect_participants = intersect_src_block_participants.filter(
          (p) => intersect_dst_block_participants.includes(p),
        );
        addLink(
          links,
          src_block_id,
          dst_block_id,
          src_column_id_prefix,
          dst_column_id_prefix,
          combination,
          intersect_participants,
        );
      });
    });
  });

  // find out which combination is the overlapping one
  const first_block_combinations = Object.keys(
    block_combinations[src_block_ids[0]],
  );
  const second_block_combinations = Object.keys(
    block_combinations[src_block_ids[1]],
  );
  // c0: one block
  const c0 = first_block_combinations.filter(
    (value) => !second_block_combinations.includes(value),
  )[0];
  // c1: both blocks
  const c1 = first_block_combinations.filter((value) =>
    second_block_combinations.includes(value),
  )[0];
  // c2: one block
  const c2 = second_block_combinations.filter(
    (value) => !first_block_combinations.includes(value),
  )[0];
  return generate_overlapping_paths(
    svgId,
    block_combinations,
    links,
    src_block_ids,
    c0,
    c1,
    c2,
  );
}

function generate_overlapping_paths(
  svgId: string,
  block_combinations: { [key: string]: { [key: string]: string[] } },
  links: tLink[],
  src_block_ids: string[],
  c0: string,
  c1: string,
  c2: string,
) {
  const svg = d3.select(svgId);
  const svg_bbox = svg.node().getBoundingClientRect();
  const block_position1 = d3
    .select(`#${src_block_ids[0]}`)
    .node()
    .getBoundingClientRect();
  const block_position2 = d3
    .select(`#${src_block_ids[1]}`)
    .node()
    .getBoundingClientRect();
  // determine which block is the upper block
  let upper_block: string, lower_block: string;
  if (block_position1.y < block_position2.y) {
    upper_block = src_block_ids[0];
    lower_block = src_block_ids[1];
  } else {
    upper_block = src_block_ids[1];
    lower_block = src_block_ids[0];
  }
  // assure that c0 is the upper block unique combination, and c1 is the lower block unique combination
  if (!block_combinations[upper_block][c0]) {
    const tmp = c0;
    c0 = c1;
    c1 = tmp;
  }
  // compute the offset of each combination in upper and lower blocks
  const block_offset_ratios = _block_offset_ratios(block_combinations);
  const upper_block_cutoff = Object.values(block_offset_ratios[upper_block])
    .flat()
    .filter((v) => v !== 0 && v !== 1)[0];
  const lower_block_cutoff = Object.values(block_offset_ratios[lower_block])
    .flat()
    .filter((v) => v !== 0 && v !== 1)[0];
  const src_block_combination_offsets = {
    [upper_block]: {
      [c0]: [0, upper_block_cutoff],
      [c1]: [upper_block_cutoff, 1],
    },
    [lower_block]: {
      [c1]: [0, lower_block_cutoff],
      [c2]: [lower_block_cutoff, 1],
    },
  };

  let paths: tPathData[] = [];
  // unique links
  links.forEach((link: tLink) => {
    if (link.combination === c1) return;
    const source_block_combination_offset = src_block_combination_offsets[
      link.source
    ][link.combination] as [number, number];
    const source_computation = compute_block_offset(
      link.source,
      source_block_combination_offset,
      svg_bbox,
      true,
    );
    const source_end = source_computation.pos;
    const source_height = source_computation.height;
    const target_block_combination_offset =
      block_offset_ratios[link.target][link.combination];
    const target_computation = compute_block_offset(
      link.target,
      target_block_combination_offset,
      svg_bbox,
      false,
    );
    const target_start = target_computation.pos;
    const target_height = target_computation.height;
    let path = generate_flow(
      source_end,
      target_start,
      source_height,
      target_height,
    );
    paths.push({
      id: link.combination,
      participants: link.participants,
      source: link.source,
      target: link.target,
      source_column: link.source_column,
      target_column: link.target_column,
      class: "flow",
      path: path,
    });
  });

  // common links
  let source_x: number;
  let source_starts: number[] = [];
  let source_ends: number[] = [];
  links.forEach((link: tLink) => {
    if (link.combination !== c1) return;
    const source_block_combination_offset = src_block_combination_offsets[
      link.source
    ][link.combination] as [number, number];
    const source_computation = compute_block_offset(
      link.source,
      source_block_combination_offset,
      svg_bbox,
      true,
    );
    const source_end = source_computation.pos;
    const source_height = source_computation.height;
    source_x = source_end.x;
    source_starts.push(source_end.y);
    source_ends.push(source_end.y + source_height);
  });
  const source_start = Math.min(...source_starts);
  const source_end = Math.max(...source_ends);
  links.forEach((link: tLink) => {
    if (link.combination !== c1) return;
    const target_block_combination_offset =
      block_offset_ratios[link.target][link.combination];
    const target_computation = compute_block_offset(
      link.target,
      target_block_combination_offset,
      svg_bbox,
      false,
    );
    const target_start = target_computation.pos;
    const target_height = target_computation.height;
    let path = generate_flow(
      { x: source_x, y: source_start },
      target_start,
      source_end - source_start,
      target_height,
    );
    paths.push({
      id: link.combination,
      participants: link.participants,
      source: link.source,
      target: link.target,
      source_column: link.source_column,
      target_column: link.target_column,
      class: "flow",
      path: path,
    });
  });
  return paths;
}

export function intersection(list_of_arrays: any[][]) {
  if (list_of_arrays.length === 0) return [] as any[];
  let intersection: any[] = list_of_arrays[0];
  list_of_arrays.forEach((array, i) => {
    intersection = array.filter((value) => intersection.includes(value));
  });
  return intersection;
}

export function connected_components(
  ordered_columns: tColumnMetadata[],
  clicked_blocks: tBlock[],
) {
  const clicked_columns = clicked_blocks.map((block) => block.column_id);
  let connected_components: tColumnMetadata[][] = [];
  let current_components: tColumnMetadata[] = [];
  ordered_columns.forEach((column) => {
    if (clicked_columns.includes(column.column_id_prefix)) {
      current_components.push(column);
    } else {
      if (current_components.length > 0) {
        connected_components.push(current_components);
        current_components = [];
      }
    }
  });
  if (current_components.length > 0) {
    connected_components.push(current_components);
    current_components = [];
  }
  return connected_components;
}
