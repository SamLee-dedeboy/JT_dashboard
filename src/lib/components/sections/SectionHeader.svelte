<script lang="ts">
  import type { tSectionMetadata } from "../../../types/flow";
  import { createEventDispatcher, getContext } from "svelte";
  import { fade } from "svelte/transition";
  import * as Constants from "../../../constants/flow";
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
  class="header-container section-header pointer-events-auto relative flex text-lg text-gray-500"
>
  {#if show_category_curation_menu}
    <div
      transition:fade
      bind:this={curate_category_container}
      class="curate-category-container rounded-xs pointer-events-auto absolute left-0 top-0 z-50 flex flex-col gap-y-1 divide-y bg-white px-2 py-1 font-mono text-[0.8rem] font-normal shadow-[0px_0px_1px_1px_gray]"
      onclick={(e) => {
        if (!e.defaultPrevented) {
          e.preventDefault();
          show_column_selection_menu = false;
        }
      }}
      onkeyup={() => {}}
    >
      <div class="remove-category-container flex divide-x">
        {#each Object.keys(options) as column, index}
          <div class="column-group flex flex-col gap-y-1 divide-y px-1">
            <div class="capitalize">
              {category_to_title(column)}
            </div>
            {#each options[column] as category, index}
              <div class="option-item relative flex items-center pr-6">
                <div class="option-item-content text-left">{category}</div>
                <div
                  role="button"
                  tabindex={index}
                  class="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-gray-300"
                  onclick={(e) => handleRemoveCategory(e, column, category)}
                  onkeyup={() => {}}
                >
                  <img
                    src="circle-minus.svg"
                    alt="?"
                    class="pointer-events-none hidden h-[1rem] w-[1rem]"
                  />
                </div>
              </div>
            {/each}
          </div>
        {/each}
      </div>
      <div class="flex gap-x-1 py-1">
        {#if Object.keys(options).length === 1}
          <div class="w-fit"></div>
        {:else}
          <div class="relative w-fit">
            <div
              role="button"
              tabindex="0"
              class="flex h-[1.5rem] w-max items-center gap-x-2 rounded-sm px-1 outline-1 outline-gray-200 hover:bg-gray-300"
              onclick={(e) => {
                e.preventDefault();
                show_column_selection_menu = !show_column_selection_menu;
              }}
              onkeyup={() => {}}
            >
              {category_to_title(selected_column)}
              <img
                src="chevron-down.svg"
                alt="v"
                class="h-4 w-4 text-gray-400"
              />
            </div>
            {#if show_column_selection_menu}
              <div
                transition:fade
                class="column-menu absolute left-1/2 z-10 flex w-max -translate-x-1/2 flex-col items-center justify-around divide-y bg-white outline-1"
              >
                {#each Object.keys(options) as column}
                  <div
                    role="button"
                    tabindex="0"
                    class="w-full cursor-pointer select-none px-0.5 font-light hover:bg-gray-300"
                    onclick={(e) => {
                      e.preventDefault();
                      selected_column = column;
                      show_column_selection_menu = false;
                    }}
                    onkeyup={() => {}}
                  >
                    {category_to_title(column)}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
        <div class="editable-container h-fit outline-1 outline-gray-300">
          <div contenteditable class="editable min-h-[1rem] w-[12rem]"></div>
        </div>
        <div
          role="button"
          tabindex="0"
          class="flex h-6 w-6 cursor-pointer select-none items-center rounded-full p-1 font-light hover:bg-gray-200"
          onclick={(e) => handleAddCategory(e)}
          onkeyup={() => {}}
        >
          <img src="circle_plus.svg" alt="add" class="" />
        </div>
      </div>
      <div class="flex flex-col gap-y-1 py-1">
        <span class="w-fit"> Change Actions: </span>
        {#each changes as change, index}
          <div class="flex gap-x-1 divide-x px-0.5">
            <div class="w-[3rem] shrink-0 uppercase">{change.action}</div>
            <div class="shrink-0 px-1">{category_to_title(change.column)}</div>
            <div class="shrink-0 px-1">{change.value}</div>
            <div
              role="button"
              tabindex="0"
              class=" rounded-full p-0.5 hover:bg-gray-300"
              onclick={(e) => handleRemoveChange(e, index)}
              onkeyup={() => {}}
            >
              <img
                src="circle-minus.svg"
                alt="?"
                class="pointer-events-none h-[1rem] w-[1rem]"
              />
            </div>
          </div>
        {/each}
      </div>
      <div class="flex gap-x-2 py-1">
        <div
          role="button"
          tabindex="0"
          class="w-fit cursor-pointer select-none rounded bg-green-50 px-0.5 font-light outline-1 outline-green-300 hover:bg-green-200"
          class:submit-disabled={changes.length === 0}
          onclick={(e) => handleSubmit(e, changes)}
          onkeyup={() => {}}
        >
          Submit
        </div>
        <div
          role="button"
          tabindex="0"
          class="w-fit cursor-pointer select-none rounded bg-red-50 px-0.5 font-light outline-1 outline-red-300 hover:bg-red-200"
          onclick={(e) => {
            e.preventDefault();
            show_category_curation_menu = false;
          }}
          onkeyup={() => {}}
        >
          Cancel
        </div>
      </div>
    </div>
  {/if}

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
    @apply relative mb-0 flex select-none items-center justify-center rounded bg-slate-200 px-1 text-center font-serif font-bold;
    @apply shadow-[0px_0px_1px_rgba(0,0,0,0.3)];
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
    color: #555;
  }

  .editable[placeholder]:empty:focus:before {
    content: "";
  }
  .submit-disabled {
    @apply pointer-events-none cursor-not-allowed opacity-50;
  }
</style>
