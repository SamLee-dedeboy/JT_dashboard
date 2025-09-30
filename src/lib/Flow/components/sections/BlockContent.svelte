<script lang="ts">
  import type { tGroupOfPeopleBlockContent, tChange } from "../../types";
  import { fade, slide } from "svelte/transition";
  import { createEventDispatcher, tick, getContext, onMount } from "svelte";
  import * as Constants from "../../constants";
  // import ChangeHistory from "./ChangeHistory.svelte";
  import { participantState, sectionState } from "../../flow_store.svelte";

  const dispatch = createEventDispatcher();

  // Use $props() for Svelte 5
  let {
    section_id,
    column_id,
    current_category,
    content,
  }: {
    section_id: string;
    column_id: string;
    current_category: string;
    content: tGroupOfPeopleBlockContent;
  } = $props();

  // Use $derived to get state values
  const category_options = $derived(sectionState.category_options);
  const participant_colors = $derived(participantState.participant_colors);

  // const fetchData: any = getContext("fetchData");
  let edit_modes = $state(content.map(() => false));
  let changed = $state(content.map(() => false));
  let show_category_menu = $state(content.map(() => false));
  // let change_history: { [key: string]: tChange[] } = {};
  let adding_new_response = $state(false);

  onMount(() => {
    document
      .querySelector(".block-content-container")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
      });
  });

  async function handleAddResponse(e) {
    e.preventDefault();
    const input_participant: HTMLElement | null = document.querySelector(
      ".input-add-participant"
    );
    const p_number = input_participant?.innerText.trim() || "";
    const input_response: HTMLElement | null = document.querySelector(
      ".input-add-response"
    );
    const response = input_response?.innerText.trim() || "";
    if (p_number === "" || response === "") return;
    const pid = Object.keys(Constants.initial_to_id_dict).find(
      (key) => +Constants.initial_to_id_dict[key] === +p_number
    );
    if (!pid) return;
    console.log({ pid, response, p_number });
    // if (!change_history[pid]) change_history[pid] = [];
    // change_history[pid].push({
    //   section: section_id,
    //   column: column_id,
    //   pid: pid,
    //   action: Constants.response.ADD,
    //   before: current_category,
    //   before_value: "N/A",
    //   after: response,
    //   before_title: "N/A",
    //   after_title: response,
    // });
    // change_history = change_history;
    // console.log({ change_history });
  }
  async function handleEdit(e, i) {
    e.preventDefault();
    edit_modes[i] = true;
    await tick();
    const content_element = document.querySelectorAll(".content")[
      i
    ] as HTMLElement;
    content_element.focus();
  }

  function handleEditDone(e, i) {
    console.log("edit done");
    e.preventDefault();
    const after = e.target.innerText.trim();
    edit_modes[i] = false;
    if (content[i][1] === after) return;
    const pid = content[i][0];
    // if (!change_history[pid]) change_history[pid] = [];
    // if (
    //   change_history[pid]
    //     .map((change) => change.action)
    //     .includes(Constants.response.EDIT)
    // ) {
    //   const edit_action_index = change_history[pid].findIndex(
    //     (change) => change.action === Constants.response.EDIT
    //   );
    //   change_history[pid][edit_action_index] = {
    //     section: section_id,
    //     pid: content[i][0],
    //     action: Constants.response.EDIT,
    //     column: column_id,
    //     before: content[i][1],
    //     before_value: content[i][1],
    //     after: after,
    //     before_title: content[i][1],
    //     after_title: after,
    //   };
    // } else {
    //   change_history[pid].push({
    //     // change_history[i] = {
    //     section: section_id,
    //     pid: content[i][0],
    //     action: Constants.response.EDIT,
    //     column: column_id,
    //     before: content[i][1],
    //     before_value: content[i][1],
    //     after: after,
    //     before_title: content[i][1],
    //     after_title: after,
    //   });
    // }
    // change_history = change_history;
    // console.log({ change_history });
    // change_history = [...change_history];
    const content_element = document.querySelectorAll(".content")[
      i
    ] as HTMLElement;
    content_element.blur();
    changed[i] = true;
  }

  function handleMove(e, i, target_category: string) {
    e.preventDefault();
    const pid = content[i][0];
    // if (!change_history[pid]) change_history[pid] = [];
    // change_history[pid].push({
    //   // change_history[i] = {
    //   section: section_id,
    //   column: column_id,
    //   pid: content[i][0],
    //   action: Constants.response.MOVE,
    //   before: current_category,
    //   before_value: content[i][1],
    //   after: target_category,
    //   before_title: content[i][1],
    //   after_title: target_category,
    // });
    // change_history = change_history;
    // // change_history = [...change_history];
    // changed[i] = true;
  }

  function handleRemove(e, i) {
    e.preventDefault();
    const pid = content[i][0];
    // if (!change_history[pid]) change_history[pid] = [];
    // change_history[pid].push({
    //   // change_history[i] = {
    //   section: section_id,
    //   column: column_id,
    //   action: Constants.response.DELETE,
    //   pid: content[i][0],
    //   before: content[i][1],
    //   before_value: content[i][1],
    //   after: "",
    //   before_title: content[i][1],
    //   after_title: "",
    // });
    // change_history = change_history;
    // // change_history = [...change_history];
    // changed[i] = true;
  }

  function handleNavigate(e, i) {
    e.preventDefault();
    const pid = content[i][0];
    const column = column_id;
    const target = content[i][1];
    dispatch("navigate", { pid, section_id, column, target });
  }

  async function handleSubmit(
    e,
    change_history_grouped: { [key: string]: tChange[] }
  ) {
    e.preventDefault();
    console.log({ change_history_grouped });
    await fetch(Constants.server_address + "/curate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(change_history_grouped),
    });
    // fetchData();
  }

  function handleClear(e) {
    e.preventDefault();
    // change_history.forEach((change) => {
    //   if (change === undefined) return;
    //   if (change.action === Constants.EDIT) {
    //     const i = content.findIndex((c) => c[0] == change.pid);
    //     const content_element = document.querySelectorAll(".content")[
    //       i
    //     ] as HTMLElement;
    //     content_element.innerText = change.before;
    //   }
    // });
    // change_history = {};
    // change_history = content.map(() => undefined);
    changed = content.map(() => false);
    edit_modes = content.map(() => false);
  }
</script>

<div
  class="block-content-container flex flex-col gap-y-0.5 divide-y divide-black bg-white pr-3"
>
  <div class="header-container flex gap-x-1">
    <div
      role="button"
      tabindex="0"
      class="w-fit rounded-sm bg-green-200 px-0.5 outline outline-1 outline-green-400 hover:bg-green-300"
      on:click={(e) => {
        // handleSubmit(e, change_history);
      }}
      on:keyup={() => {}}
    >
      <img src="submit.svg" alt="Submit" />
    </div>
    <div
      role="button"
      tabindex="0"
      class="w-fit rounded-sm bg-red-200 px-0.5 outline outline-1 outline-red-400 hover:bg-red-300"
      on:click={(e) => {
        handleClear(e);
      }}
      on:keyup={() => {}}
    >
      <img src="submit.svg" alt="Clear" />
    </div>
    <div
      role="button"
      tabindex="0"
      class="icon-container right-0 ml-auto w-fit hover:bg-gray-300"
      on:click={(e) => {
        e.preventDefault();
        dispatch("hide");
      }}
      on:keyup={() => {}}
    >
      <img src="minimize.svg" title="close" alt="close" />
    </div>
  </div>
  <div class="header">Change History</div>
  <!-- <ChangeHistory {change_history}></ChangeHistory> -->
  <div class="header relative">
    Participant Responses
    {#if Constants.column_can_add[column_id]}
      <div
        role="button"
        tabindex="0"
        class="absolute right-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full hover:bg-gray-400"
        on:click={async (e) => {
          e.preventDefault();
          adding_new_response = true;
          await tick();
          document.querySelector(".input-add-participant")?.focus();
        }}
        on:keyup={() => {}}
      >
        <img src="circle_plus.svg" alt="+" title="add" />
      </div>
    {/if}
  </div>
  {#if adding_new_response}
    <div
      transition:slide
      class="flex gap-x-1 divide-x divide-solid divide-black bg-white py-0.5 outline outline-1 outline-black"
    >
      <div
        role="textbox"
        tabindex="0"
        contenteditable
        class="input-add-participant w-full min-w-[1rem] max-w-[2rem] px-0.5"
        on:keypress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      ></div>
      <div
        role="textbox"
        tabindex="0"
        contenteditable
        class="input-add-response w-full px-0.5"
      ></div>
      <div class="right-0 ml-auto flex gap-x-1 px-1">
        <div
          role="button"
          tabindex="0"
          class="h-fit rounded bg-green-200 px-0.5 outline outline-1 outline-green-400 hover:bg-green-300 focus:outline-2"
          on:click={(e) => {
            handleAddResponse(e);
            adding_new_response = false;
          }}
          on:keyup={() => {}}
        >
          Done
        </div>
        <div
          role="button"
          tabindex="0"
          class="h-fit rounded bg-red-200 px-0.5 outline outline-1 outline-red-400 hover:bg-red-300 focus:outline-2"
          on:click={(e) => {
            adding_new_response = false;
          }}
          on:keyup={() => {}}
        >
          Cancel
        </div>
      </div>
    </div>
  {/if}
  {#each content as participant_response, index}
    <div
      class="flex gap-x-3"
      class:changed={changed[index]}
      style={`z-index: ${content.length - index}; background-color: ${
        $participant_colors[participant_response[0]]
      }`}
    >
      <div>
        {Constants.initial_to_id_dict[participant_response[0]] ||
          participant_response[0]}
      </div>
      <div
        role="textbox"
        tabindex="0"
        contenteditable={edit_modes[index]}
        class="content w-full px-0.5"
        style={`cursor: ${edit_modes[index] ? "text" : "default"};`}
        on:dblclick={(e) => handleEdit(e, index)}
        on:keypress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleEditDone(e, index);
          }
        }}
      >
        {participant_response[1].trim()}
      </div>
      <div class="flex gap-x-1">
        <div
          role="button"
          tabindex={0}
          class="icon-container"
          on:click={(e) => handleEdit(e, index)}
          on:keyup={() => {}}
        >
          <img src="pencil.svg" title="edit" alt="edit" />
        </div>
        <div
          role="button"
          tabindex={0}
          class="icon-container relative"
          on:click={(e) => {
            if (e.defaultPrevented) return;
            e.preventDefault();
            show_category_menu[index] = !show_category_menu[index];
          }}
          on:keyup={() => {}}
        >
          <img src="clip_board.svg" title="move" alt="move" />
          <div
            transition:fade
            class={`${
              show_category_menu[index] ? "" : "hidden"
            } absolute left-[50%] top-[100%] w-[7rem] -translate-x-1/2`}
          >
            <div
              class="z-[999] flex flex-col items-center justify-around divide-y rounded-sm bg-white outline outline-1 outline-black"
            >
              {#each $category_options[Constants.column_to_options_dict[column_id]] as option}
                <div
                  role="button"
                  tabindex={4 * index + 1}
                  class="flex w-full items-center justify-center text-center text-xs hover:bg-gray-300"
                  on:click={(e) => {
                    e.preventDefault();
                    handleMove(e, index, option);
                    show_category_menu[index] = false;
                  }}
                  on:keyup={() => {}}
                >
                  {option}
                </div>
              {/each}
            </div>
          </div>
        </div>
        <div
          role="button"
          tabindex={0}
          class="icon-container"
          on:click={(e) => handleNavigate(e, index)}
          on:keyup={() => {}}
        >
          <img src="link.svg" title="source" alt="src" />
        </div>
        <div
          role="button"
          tabindex={0}
          class="icon-container"
          on:click={(e) => handleRemove(e, index)}
          on:keyup={() => {}}
        >
          <img src="delete.svg" title="remove" alt="remove" />
        </div>
      </div>
    </div>
  {/each}
</div>

<style lang="postcss">
  @reference "tailwindcss";
  /* .content:hover {
    @apply outline outline-1 outline-black;
  } */
  .header {
    @apply bg-slate-200  p-0.5 text-center;
  }
  .content:focus {
    @apply outline outline-2 outline-blue-400;
  }
  .icon-container {
    @apply flex h-5 w-5 items-center justify-center p-0.5 hover:bg-gray-300;
  }
  .changed {
    @apply bg-gray-200;
  }
</style>
