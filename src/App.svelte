<script lang="ts">
  import Router, { push } from "svelte-spa-router";
  import Home from "./lib/Home.svelte";
  import MentalModel from "./lib/MentalModel/MentalModel.svelte";
  import Sunburst from "./lib/Sunburst/Sunburst.svelte";
  import Linking from "./lib/Linking/Linking.svelte";
  import Flow from "./lib/Flow/Flow.svelte";

  const routes = {
    "/": Home,
    "/mental-model": MentalModel,
    "/sunburst": Sunburst,
    "/linking": Linking,
    "/flow": Flow,
  };

  const navigateHome = () => {
    push("/");
  };
</script>

<main class="flex flex-col">
  <div
    tabindex="0"
    role="button"
    class="jt-section-title text-[2.5rem] text-[#253439] bg-[#7ed957] pl-4 flex items-center uppercase cursor-pointer"
    on:click={navigateHome}
    on:keyup={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        navigateHome();
      }
    }}
  >
    Just Transitions
  </div>
  <Router {routes} />
</main>

<style lang="postcss">
  @reference "tailwindcss";
  main {
    min-height: 100vh;
    display: flex;
  }
</style>
