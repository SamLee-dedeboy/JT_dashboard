<script lang="ts">
  import { server_address } from "../../constants/mental_model";
  import { onMount } from "svelte";
  import ExhibitionMmBubbles from "./ExhibitionMMBubbles.svelte";

  let mental_models: any[] = $state([]);
  let participants: any[] = $state([]);
  function fetchMMs() {
    // fetch(`${server_address}/mental_model/exhibition/`)
    fetch(`${server_address}/mental_model/interview/`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        mental_models = data.mental_models;
        participants = data.participants;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  onMount(() => {
    fetchMMs();
  });
</script>

{#each mental_models as mental_model, index}
  {#if participants[index] === "SB"}
    <div class="flex w-[45rem] h-[45rem] relative">
      <div class="text-white absolute left-1 top-1">{participants[index]}</div>
      <ExhibitionMmBubbles
        svgId={`mental_model_svg_${index}`}
        nodes={mental_model}
        loading={false}
        stateless={false}
        handleUpdateNodeCategory={() => {}}
      />
    </div>
  {/if}
{/each}

<style lang="postcss">
</style>
