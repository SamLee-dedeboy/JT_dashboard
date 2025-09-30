import type {
  tBlock,
  tBackground,
  tBackgroundChunk,
  tMetadata,
  tDataset,
  tDriversOfChangeChunk,
  tFutureManagementChunk,
  tDecisionMakingChunk,
  tLink,
  tDecisionMakingBlockContent,
} from "../types/flow";
import * as Utils from "../renderers/FlowRenderUtils";
import * as Constants from "../constants/flow";
export class BlockAggregator {
  background_blocks: {
    category_blocks: tBlock[];
    block_participants: [string, string[]][];
    total_participants: number;
  };
  driver_blocks: {
    factor_category_blocks: tBlock[];
    block_participants: [string, string[]][];
    total_participants: number;
  };
  future_management_blocks: {
    strategy_blocks: tBlock[];
    block_participants: [string, string[]][];
    total_participants: number;
  };
  decision_making_blocks: {
    block_dict: { [key: string]: tBlock[] };
    block_participants: [string, string[]][];
    total_participants: number;
    participants: number;
    block_totals: { [key: string]: number };
    links: tLink[];
  };
  max_participants: number;
  constructor(dataset: tDataset) {
    this.background_blocks = this.aggregate_background(
      dataset.background,
      dataset.metadata,
    );
    this.driver_blocks = this.aggregate_drivers_of_change(
      dataset.drivers_of_change,
      dataset.metadata,
    );
    this.future_management_blocks = this.aggregate_future_management_blocks(
      dataset.future_management,
      dataset.metadata,
    );
    this.decision_making_blocks = this.aggregate_decision_making_blocks(
      dataset.decision_making,
      dataset.metadata,
    );
    this.max_participants = Math.max(
      this.background_blocks.total_participants,
      this.driver_blocks.total_participants,
      this.future_management_blocks.total_participants,
      this.decision_making_blocks.total_participants,
    );
    console.log("background_blocks", this.background_blocks);
    console.log("driver_blocks", this.driver_blocks);
    console.log("future_management_blocks", this.future_management_blocks);
    console.log("decision_making_blocks", this.decision_making_blocks);
    console.log("max_participants", this.max_participants);
  }
  get_all_block_participants() {
    return [
      ...this.background_blocks.block_participants,
      ...this.driver_blocks.block_participants,
      ...this.future_management_blocks.block_participants,
      ...this.decision_making_blocks.block_participants,
    ];
  }
  get_blocks(section_id: string, column_id: string) {
    if (section_id === "background") {
      return this.background_blocks.category_blocks;
    } else if (section_id === "drivers_of_change") {
      return this.driver_blocks.factor_category_blocks;
    } else if (section_id === "future_management") {
      return this.future_management_blocks.strategy_blocks;
    } else if (section_id === "decision_making") {
      return this.decision_making_blocks.block_dict[column_id];
    } else {
      return [];
    }
  }

  aggregate_background(
    background_data: tBackgroundChunk[],
    metadata: tMetadata,
  ) {
    let category_blocks: tBlock[] = [];
    // let background_summary_blocks: tBlock[] = [];
    let category_participants = {};
    let category_content = {};
    background_data
      .map((d) => d.summary)
      .forEach((background: tBackground) => {
        const id = background.id;
        // categories
        background.categories.forEach((category) => {
          category = Constants.category_process_func(category);
          if (!category_participants[Constants.category_column_id + category])
            category_participants[Constants.category_column_id + category] = [];
          category_participants[Constants.category_column_id + category].push(
            id,
          );
          if (!category_content[Constants.category_column_id + category])
            category_content[Constants.category_column_id + category] = [];
          category_content[Constants.category_column_id + category].push({
            participant: id,
            category: category,
            occupation: background["relationship to the delta"],
          });
        });
      });
    metadata.participant_categories.forEach((category) => {
      const category_id =
        Constants.category_column_id +
        Constants.category_process_func(category);
      const participants = category_participants[category_id] || [];
      Utils.update_blocks(category_blocks, {
        id: category_id,
        column_id: Constants.category_column_id,
        title: category,
        participants: participants,
        content: category_content[category_id]?.map(
          (participant_occupation) => [
            participant_occupation.participant,
            participant_occupation.occupation,
          ],
        ),
      });
    });
    category_blocks = category_blocks.sort((a, b) => {
      return (
        (b.participants?.length || 0) - (a.participants?.length || 0) ||
        a.title.localeCompare(b.title)
      );
    });
    let block_participants: [string, string[]][] = category_blocks.map(
      (block) => [block.id, block.participants],
    );
    let total_participants = category_blocks.reduce(
      (acc, cur) => acc + (cur.participants?.length || 0),
      0,
    );
    return {
      category_blocks,
      block_participants,
      total_participants,
    };
  }

  aggregate_drivers_of_change(
    driver_data: tDriversOfChangeChunk[],
    metadata: tMetadata,
  ) {
    let factor_category_blocks: tBlock[] = [];
    // let driver_summary_blocks: tBlock[] = [];

    let factor_category_participants = {};
    let factor_category_content = {};
    driver_data
      .map((d) => d.summary)
      .forEach((driver) => {
        const id = driver.id;
        // factors
        driver.factors.forEach((factor, index) => {
          const factor_category = Constants.category_process_func(
            factor.category,
          );
          if (
            !factor_category_participants[
              Constants.factor_column_id + factor_category
            ]
          )
            factor_category_participants[
              Constants.factor_column_id + factor_category
            ] = [];
          factor_category_participants[
            Constants.factor_column_id + factor_category
          ].push(id);
          if (
            !factor_category_content[
              Constants.factor_column_id + factor_category
            ]
          )
            factor_category_content[
              Constants.factor_column_id + factor_category
            ] = [];
          factor_category_content[
            Constants.factor_column_id + factor_category
          ].push({
            participant: id,
            factor: factor.factor_name,
          });
        });
        // summaries
        // driver_summary_blocks.push({
        //   id: driver_summary_column_id + id,
        //   title: id,
        //   participants: [id],
        //   content: driver["summary"],
        // });
      });
    metadata.factor_categories.forEach((category) => {
      const category_id =
        Constants.factor_column_id + Constants.category_process_func(category);
      Utils.update_blocks(factor_category_blocks, {
        id: category_id,
        column_id: Constants.factor_column_id,
        title: category,
        participants: [
          ...new Set<string>(factor_category_participants[category_id]),
        ],
        content: factor_category_content[category_id]?.map(
          (participant_factor) => [
            participant_factor.participant,
            participant_factor.factor,
          ],
        ),
      });
    });
    factor_category_blocks = factor_category_blocks.sort((a, b) => {
      return (
        (b.participants?.length || 0) - (a.participants?.length || 0) ||
        a.title.localeCompare(b.title)
      );
    });
    let block_participants: [string, string[]][] = factor_category_blocks.map(
      (block) => [block.id, block.participants],
    );
    let total_participants = factor_category_blocks.reduce(
      (acc, cur) => acc + (cur.participants?.length || 0),
      0,
    );
    return {
      factor_category_blocks,
      block_participants,
      total_participants,
    };
  }
  aggregate_future_management_blocks(
    future_management_data: tFutureManagementChunk[],
    metadata: tMetadata,
  ) {
    let strategy_blocks: tBlock[] = [];
    // let management_summary_blocks: tBlock[] = [];

    let strategy_category_participants = {};
    let strategy_category_content = {};
    future_management_data
      .map((d) => d.summary)
      .forEach((management) => {
        const id = management.id;
        const strategies =
          management["important salinity management strategies"];
        management["important salinity management strategies"].forEach(
          (strategy, index) => {
            const strategy_category = Constants.category_process_func(
              strategy.category,
            );
            if (
              !strategy_category_participants[
                Constants.strategy_column_id + strategy_category
              ]
            )
              strategy_category_participants[
                Constants.strategy_column_id + strategy_category
              ] = [];
            strategy_category_participants[
              Constants.strategy_column_id + strategy_category
            ].push(id);
            if (
              !strategy_category_content[
                Constants.strategy_column_id + strategy_category
              ]
            )
              strategy_category_content[
                Constants.strategy_column_id + strategy_category
              ] = [];
            strategy_category_content[
              Constants.strategy_column_id + strategy_category
            ].push({
              participant: id,
              strategy: strategy.strategy,
            });
          },
        );

        // summaries
        // management_summary_blocks.push({
        //   id: management_summary_column_id + id,
        //   title: id,
        //   participants: [id],
        //   content: management["summary"],
        // });
      });
    metadata.strategy_categories.forEach((category) => {
      const category_id =
        Constants.strategy_column_id +
        Constants.category_process_func(category);
      Utils.update_blocks(strategy_blocks, {
        id: category_id,
        column_id: Constants.strategy_column_id,
        title: category,
        participants: [
          ...new Set<string>(strategy_category_participants[category_id]),
        ],
        content: strategy_category_content[category_id]?.map(
          (participant_strategy) => [
            participant_strategy.participant,
            participant_strategy.strategy,
          ],
        ),
      });
    });
    strategy_blocks = strategy_blocks.sort((a, b) => {
      return (
        (b.participants?.length || 0) - (a.participants?.length || 0) ||
        a.title.localeCompare(b.title)
      );
    });
    let block_participants: [string, string[]][] = strategy_blocks.map(
      (block) => [block.id, block.participants],
    );
    let total_participants = strategy_blocks.reduce(
      (acc, cur) => acc + (cur.participants?.length || 0),
      0,
    );
    return {
      strategy_blocks,
      block_participants,
      total_participants,
    };
  }

  aggregate_decision_making_blocks(
    decision_making_data: tDecisionMakingChunk[],
    metadata: tMetadata,
  ) {
    let fairness = {
      fair: [],
      unfair: [],
      unclear: [],
    };
    let fairness_blocks: tBlock[] = [];
    let represented_blocks: tBlock[] = [];
    let not_represented_blocks: tBlock[] = [];
    let others_blocks: tBlock[] = [];
    let block_dict: { [key: string]: tBlock[] } = {};
    // let comments_blocks: tBlock[] = [];
    // let decision_making_summary_blocks: tBlock[] = [];
    let block_totals: { [key: string]: number } = {};

    let represented_category_participants: { [key: string]: string[] } = {};
    let represented_category_content: tDecisionMakingBlockContent = {};
    let not_represented_category_participants: { [key: string]: string[] } = {};
    let not_represented_category_content: tDecisionMakingBlockContent = {};
    let others_category_participants: { [key: string]: string[] } = {};
    let others_represented_category_content: tDecisionMakingBlockContent = {};
    decision_making_data
      .map((d) => d.summary)
      .forEach((decision_making) => {
        const id = decision_making.id;

        // fairness
        const p_fairness = decision_making["Is the process fair"].toLowerCase();
        fairness[p_fairness].push(id);

        // fairness_reasons
        // fairness_reason_blocks.push({
        //   id: fairness_reason_column_id + id,
        //   title: id,
        //   participants: [id],
        //   content: decision_making["Reason"],
        // });

        // represented
        decision_making["Who is represented"].forEach((who) => {
          const who_category = Constants.category_process_func(who.category);
          if (
            !represented_category_participants[
              Constants.represented_column_id + who_category
            ]
          )
            represented_category_participants[
              Constants.represented_column_id + who_category
            ] = [];
          represented_category_participants[
            Constants.represented_column_id + who_category
          ].push(id);

          if (
            !represented_category_content[
              Constants.represented_column_id + who_category
            ]
          )
            represented_category_content[
              Constants.represented_column_id + who_category
            ] = [];
          represented_category_content[
            Constants.represented_column_id + who_category
          ].push({
            participant: id,
            name: who.group,
          });
        });

        // not represented
        decision_making["Who is not represented"].forEach((who) => {
          const who_category = Constants.category_process_func(who.category);
          if (
            !not_represented_category_participants[
              Constants.not_represented_column_id + who_category
            ]
          )
            not_represented_category_participants[
              Constants.not_represented_column_id + who_category
            ] = [];
          not_represented_category_participants[
            Constants.not_represented_column_id + who_category
          ].push(id);

          if (
            !not_represented_category_content[
              Constants.not_represented_column_id + who_category
            ]
          )
            not_represented_category_content[
              Constants.not_represented_column_id + who_category
            ] = [];
          not_represented_category_content[
            Constants.not_represented_column_id + who_category
          ].push({
            participant: id,
            name: who.group,
          });
        });

        // others to include
        decision_making["What other people to connect with"].forEach((who) => {
          const who_category = Constants.category_process_func(who.category);
          if (
            !others_category_participants[
              Constants.others_column_id + who_category
            ]
          )
            others_category_participants[
              Constants.others_column_id + who_category
            ] = [];
          others_category_participants[
            Constants.others_column_id + who_category
          ].push(id);

          if (
            !others_represented_category_content[
              Constants.others_column_id + who_category
            ]
          )
            others_represented_category_content[
              Constants.others_column_id + who_category
            ] = [];
          others_represented_category_content[
            Constants.others_column_id + who_category
          ].push({
            participant: id,
            name: who.group,
          });
        });

        // comments
        // comments_blocks.push({
        //   id: comments_column_id + id,
        //   title: id,
        //   participants: [id],
        //   content:
        //     decision_making["comments on the decision-making in the Delta"],
        // });

        // decision making summary
        //   decision_making_summary_blocks.push({
        //     id: decision_making_summary_column_id + id,
        //     title: id,
        //     participants: [id],
        //     content: decision_making["summary"],
        //   });
        // });
      });
    Object.entries(fairness).forEach(([key, value]) => {
      fairness_blocks.push({
        id: Constants.fairness_column_id + key,
        column_id: Constants.fairness_column_id,
        title: key + ": " + value.length,
        participants: value,
        content: value.map((p) => [p, key]),
      });
    });
    // represented blocks
    represented_blocks = Utils.aggregate_blocks(
      metadata.represented_categories,
      represented_category_participants,
      represented_category_content,
      Constants.represented_column_id,
      Constants.category_process_func,
    );
    not_represented_blocks = Utils.aggregate_blocks(
      metadata.not_represented_categories,
      not_represented_category_participants,
      not_represented_category_content,
      Constants.not_represented_column_id,
      Constants.category_process_func,
    );
    others_blocks = Utils.aggregate_blocks(
      metadata.others_to_include_categories,
      others_category_participants,
      others_represented_category_content,
      Constants.others_column_id,
      Constants.category_process_func,
    );
    block_totals[Constants.fairness_column_id + "fair"] =
      fairness["fair"].length;
    block_totals[Constants.fairness_column_id + "unfair"] =
      fairness["unfair"].length;
    block_totals = Utils.update_block_totals(block_totals, represented_blocks);
    block_totals = Utils.update_block_totals(
      block_totals,
      not_represented_blocks,
    );
    block_totals = Utils.update_block_totals(block_totals, others_blocks);

    block_dict = {
      fairness: fairness_blocks,
      represented_groups: represented_blocks,
      not_represented_groups: not_represented_blocks,
      others_to_include: others_blocks,
    };

    let block_participants: [string, string[]][] = fairness_blocks
      .concat(represented_blocks, not_represented_blocks, others_blocks)
      .map((block) => [block.id, block.participants]);
    let total_participants = Math.max(
      represented_blocks.reduce(
        (acc, cur) => acc + (cur.participants?.length || 0),
        0,
      ),
      not_represented_blocks.reduce(
        (acc, cur) => acc + (cur.participants?.length || 0),
        0,
      ),
      others_blocks.reduce(
        (acc, cur) => acc + (cur.participants?.length || 0),
        0,
      ),
    );
    return {
      block_dict,
      block_participants,
      total_participants,
      participants: decision_making_data.length,
      block_totals,
    };
  }
}
