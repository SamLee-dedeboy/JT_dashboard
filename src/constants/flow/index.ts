export const server_address = "http://127.0.0.1:8000/api/flow";

export const initial_to_id_dict: Record<string, number> = {
    AS: 124,
    BB: 59,
    CE: 86,
    DH: 80,
    GS: 193,
    JB: 46,
    JD: 9,
    JL: 37,
    KT: 87,
    LL: 171,
    ML: 194,
    MM: 14,
    OM: 96,
    PH: 157,
    SB: 57,
    SC: 5,
    TP: 91,
    TS: 49,
    VG: 27,
  };
  export const participant_column_id = "participant-";
  export const category_column_id = "category-";
  export const factor_column_id = "factor-category-";
  export const strategy_column_id = "strategy-";
  export const fairness_column_id = "rect-";
  export const represented_column_id = "represented-";
  export const not_represented_column_id = "not-represented-";
  export const others_column_id = "others-to-include-";
  export const category_process_func = (category) => {
    return category.toLowerCase().replaceAll(" ", "-");
  };
  export const column_id_to_title = {
    [participant_column_id]: "Participant",
    [category_column_id]: "Categories",
    [factor_column_id]: "Factors",
    [strategy_column_id]: "Strategies",
    [fairness_column_id]: "Fairness",
    [represented_column_id]: "Involved Groups",
    [not_represented_column_id]: "Overlooked Groups",
    [others_column_id]: "Others to Include",
  };
  export const column_can_add = {
    [participant_column_id]: false,
    [category_column_id]: false,
    [factor_column_id]: true,
    [strategy_column_id]: false,
    [fairness_column_id]: false,
    [represented_column_id]: true,
    [not_represented_column_id]: true,
    [others_column_id]: true,
  };
  const section_ids = {
    participant: "participant",
    background: "background",
    drivers_of_change: "drivers_of_change",
    future_management: "future_management",
    decision_making: "decision_making",
  };
  export const column_to_section_dict = {
    [participant_column_id]: section_ids.participant,
    [category_column_id]: section_ids.background,
    [factor_column_id]: section_ids.drivers_of_change,
    [strategy_column_id]: section_ids.future_management,
    [fairness_column_id]: section_ids.decision_making,
    [represented_column_id]: section_ids.decision_making,
    [not_represented_column_id]: section_ids.decision_making,
    [others_column_id]: section_ids.decision_making,
  };
  export const column_to_options_dict = {
    [category_column_id]: "participant_categories",
    [factor_column_id]: "factor_categories",
    [strategy_column_id]: "strategy_categories",
    [fairness_column_id]: fairness_column_id,
    [represented_column_id]: "represented_categories",
    [not_represented_column_id]: "not_represented_categories",
    [others_column_id]: "others_to_include_categories",
  };
  export const column_to_participant_data_key = {
    [category_column_id]: "categories",
    [factor_column_id]: "factors",
    [strategy_column_id]: "strategies",
    [fairness_column_id]: "fairness",
    [represented_column_id]: "represented_groups",
    [not_represented_column_id]: "not_represented_groups",
    [others_column_id]: "others_to_include",
  };
  // export const column_orders = [
  //   {
  //     section_id: "participant",
  //     column_key: "id",
  //     column_id: participant_column_id,
  //     value_process_func: (d) => d,
  //     type: "one",
  //   },
  //   {
  //     section_id: "background",
  //     column_key: "categories",
  //     column_id: category_column_id,
  //     value_process_func: category_process_func,
  //     type: "many",
  //   },
  //   {
  //     section_id: "drivers_of_change",
  //     column_key: "factors",
  //     column_id: factor_column_id,
  //     value_process_func: category_process_func,
  //     type: "many",
  //   },
  //   {
  //     section_id: "future_management",
  //     column_key: "strategies",
  //     column_id: strategy_column_id,
  //     value_process_func: category_process_func,
  //     type: "one",
  //   },
  //   {
  //     section_id: "decision_making",
  //     column_key: "fairness",
  //     column_id: fairness_column_id,
  //     value_process_func: (d) => d.toLowerCase(),
  //     type: "one",
  //   },
  //   {
  //     section_id: "decision_making",
  //     column_key: "represented_groups",
  //     column_id: represented_column_id,
  //     value_process_func: category_process_func,
  //     type: "many",
  //   },
  //   {
  //     section_id: "decision_making",
  //     column_key: "not_represented_groups",
  //     column_id: not_represented_column_id,
  //     value_process_func: category_process_func,
  //     type: "many",
  //   },
  //   {
  //     section_id: "decision_making",
  //     column_key: "others_to_include",
  //     column_id: others_column_id,
  //     value_process_func: category_process_func,
  //     type: "many",
  //   },
  // ];
  
  // export const column_headers = [
  //   {
  //     id: "participant",
  //     title: "Participant",
  //     start: "col-start-17",
  //     span: "col-span-5",
  //   },
  //   {
  //     id: "categories",
  //     title: "Categories",
  //     start: "col-start-24",
  //     span: "col-span-6",
  //   },
  //   {
  //     id: "factors",
  //     title: "Factors",
  //     start: "col-start-33",
  //     span: "col-span-7",
  //   },
  //   {
  //     id: "strategies",
  //     title: "Strategies",
  //     start: "col-start-46",
  //     span: "col-span-7",
  //   },
  //   {
  //     id: "fairness",
  //     title: "Fairness",
  //     start: "col-start-57",
  //     span: "col-span-5",
  //   },
  //   {
  //     id: "represented_groups",
  //     title: "Represented Groups",
  //     start: "col-start-65",
  //     span: "col-span-10",
  //   },
  //   {
  //     id: "not_represented_groups",
  //     title: "UnRepresented Groups",
  //     start: "col-start-78",
  //     span: "col-span-11",
  //   },
  //   {
  //     id: "others_to_include",
  //     title: "Others to Include",
  //     start: "col-start-92",
  //     span: "col-span-9",
  //   },
  // ];
