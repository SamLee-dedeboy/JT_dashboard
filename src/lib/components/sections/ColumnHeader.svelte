<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // Use $props() instead of export let
  let {
    id,
    title,
    hidden = $bindable(false),
  }: {
    id: string;
    title: string;
    hidden?: boolean;
  } = $props();

  const column_header_svgs = {
    Fairness: "fairness.svg",
    "Represented Groups": "user-rounded-plus.svg",
    "Overlooked Groups": "user-rounded-x.svg",
  };
</script>

<span
  class={`question-header pointer-events-auto
    relative
    mb-1 inline-flex select-none items-center 
    justify-center whitespace-nowrap rounded bg-slate-200 px-1
    text-center text-[1rem] font-semibold text-gray-500 shadow-[0px_0px_1px_rgba(0,0,0,0.2)]
`}
>
  <!-- {#if !view_mode}
    <div
      role="button"
      tabindex="-1"
      class="toggle move-left"
      onclick={() => dispatch("moveLeft")}
      onkeyup={() => {}}
    >
      <img src="move-left.svg" alt="left" class="" />
    </div>
  {/if} -->
  {#if true && Object.keys(column_header_svgs).includes(title)}
    <img
      src={column_header_svgs[title]}
      class="mr-1 h-4 w-4 text-gray-500"
      alt="*"
    />
  {/if}
  {title}
  <!-- {hidden ? title.slice(0, 5) : title} -->
  <div
    role="button"
    tabindex="0"
    class="toggle hide"
    onclick={(e) => {
      e.preventDefault();
      hidden = !hidden;
    }}
    onkeyup={() => {}}
  >
    {#if hidden}
      <img src="up-down.svg" alt="show" />
    {:else}
      <img src="minus.svg" alt="hide" />
    {/if}
  </div>
  <!-- {#if !view_mode}
    <div
      role="button"
      tabindex="-1"
      class="toggle move-right"
      onclick={() => dispatch("moveRight")}
      onkeyup={() => {}}
    >
      <img src="move-right.svg" alt="right" class="" />
    </div>
  {/if} -->
</span>

<style lang="postcss">
  @reference "tailwindcss";
  .question-header {
    & .toggle {
      @apply absolute flex cursor-pointer justify-center opacity-0 hover:bg-gray-300;
    }
    & .hide {
      @apply bottom-0 left-0 right-0 top-0;
    }
    & .move-left {
      @apply bottom-0 left-0 top-0 -translate-x-[100%];
    }
    & .move-right {
      @apply bottom-0 right-0 top-0 translate-x-[100%];
    }
  }

  .question-header:hover .toggle {
    @apply opacity-100;
  }
</style>
