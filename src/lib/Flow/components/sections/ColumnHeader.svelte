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
    justify-center whitespace-nowrap rounded  px-1
    text-center text-[1rem]  shadow-[0px_0px_1px_rgba(0,0,0,0.2)]
`}
>
  {#if true && Object.keys(column_header_svgs).includes(title)}
    <img src={column_header_svgs[title]} class="mr-1 h-4 w-4" alt="*" />
  {/if}
  {title}
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
</span>

<style lang="postcss">
  @reference "tailwindcss";
  .question-header {
    background-color: var(--jt-secondary);
    & .toggle {
      @apply absolute flex cursor-pointer justify-center opacity-0;
    }
    & .hide {
      @apply bottom-0 left-0 right-0 top-0;
    }
  }

  .question-header:hover .toggle {
    @apply opacity-100;
  }
</style>
