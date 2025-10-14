<script lang="ts">
  import type { tSectionMetadata } from "../../types";
  import { createEventDispatcher, getContext } from "svelte";
  import { fade } from "svelte/transition";
  import * as Constants from "../../constants";
  // import MoveSection from "./MoveSection.svelte";

  type tCategoryChange = {
    section: string;
    column: string;
    action: "add" | "remove";
    value: string;
  };

  const fetchData: any = getContext("fetchData");

  let {
    section = $bindable(),
    category_metadata,
    options,
  }: {
    section: tSectionMetadata;
    category_metadata: { [key: string]: string[] };
    options: { [key: string]: string[] };
  } = $props();

  let changes = $state<tCategoryChange[]>([]);
  let selected_column = $state(Object.keys(options)[0]);
  let show_column_selection_menu = $state(false);
  let show_category_curation_menu = $state(false);
  let curate_category_container = $state<HTMLElement>();

  async function handleAddCategory(e) {
    e.preventDefault();
    const editable = curate_category_container?.querySelector(
      ".editable"
    ) as HTMLElement;
    const value = editable?.innerText;
    if (value === "") {
      alert("Category cannot be empty");
      return;
    }
    const column = selected_column;
    changes.push({
      section: section.id,
      column: column,
      action: "add",
      value: value,
    });
    changes = [...changes];
  }

  async function handleSubmit(e, _changes: tCategoryChange[]) {
    await fetch(Constants.server_address + "/curate/category/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_changes),
    });
    fetchData();
  }

  async function handleRemoveCategory(e, column, category) {
    e.preventDefault();
    if (
      Object.keys(category_metadata).includes(
        `${Constants.column_to_participant_data_key[column]}-${category}`
      )
    ) {
      alert(`Cannot remove ${category} from ${column} because it is not empty`);
      return;
    } else {
      changes.push({
        section: section.id,
        column: column,
        action: "remove",
        value: category,
      });
      changes = [...changes];
    }
  }

  function handleRemoveChange(e, index) {
    e.preventDefault();
    changes.splice(index, 1);
    changes = [...changes];
  }

  function category_to_title(category) {
    return Constants.column_to_participant_data_key[category].replaceAll(
      "_",
      " "
    );
  }
</script>

<div
  class="header-container section-header pointer-events-auto relative flex text-lg"
>
  <div class="section-title relative w-full">
    {section.title}
    <div
      role="button"
      tabindex="0"
      onclick={(e) => {
        e.preventDefault();
        section.hidden = !section.hidden;
      }}
      onkeyup={() => {}}
    >
      <img
        src="minus.svg"
        alt="hide"
        class="icon hide-icon opaicty-95 absolute bottom-0 left-0 right-0 top-0 hidden h-full w-full cursor-pointer"
      />
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .section-title:hover .hide-icon {
    @apply block;
  }
  .icon {
    @apply hover:bg-gray-300;
  }
  .section-header {
    @apply relative mb-0 flex select-none items-center justify-center rounded  px-1 text-center;
    @apply shadow-[0px_0px_1px_rgba(0,0,0,0.3)];
    background-color: var(--jt-secondary);
    & .move-icon {
      @apply absolute right-0 top-0 hidden h-[1.5rem] w-[1.5rem] cursor-pointer p-1;
    }
    & .add-icon {
      @apply absolute left-0 top-0 hidden h-[1.5rem] w-[1.5rem] cursor-pointer  p-1;
    }
  }
  .section-header:hover .icon {
    @apply block;
  }

  .option-item:hover img {
    @apply block;
  }

  .editable-container {
    @apply relative;
  }
  .editable {
    display: inline-block;
    text-align: left;
    overflow-wrap: break-word;
    padding-left: 0.5rem;
  }
  .editable:focus {
    outline: none;
  }
  .editable[placeholder]:empty:before {
    content: attr(placeholder);
    color: var(--text-muted);
  }

  .editable[placeholder]:empty:focus:before {
    content: "";
  }
  .submit-disabled {
    @apply pointer-events-none cursor-not-allowed opacity-50;
  }
  .section-title {
    background-color: var(--jt-secondary);
  }
</style>
