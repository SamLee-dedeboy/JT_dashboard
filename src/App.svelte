<script lang="ts">
  import Router, { push, location } from "svelte-spa-router";
  import Home from "./lib/Home.svelte";
  import MentalModel from "./lib/MentalModel/MentalModel.svelte";
  import Sunburst from "./lib/Sunburst/Sunburst.svelte";
  import Linking from "./lib/Linking/Linking.svelte";
  import Flow from "./lib/Flow/Flow.svelte";

  const routes = {
    "/": Home,
    "/flow": Flow,
    "/linking": Linking,
    "/mental-model": MentalModel,
    "/sunburst": Sunburst,
  };

  const navigateHome = () => {
    push("/");
  };

  // Reactive statement to check if we're not on the home page
  let isNotHomePage = $derived($location !== "/");

  // Fullscreen functionality
  let isFullscreen = $state(false);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      isFullscreen = true;
    } catch (error) {
      console.warn("Could not enter fullscreen:", error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      isFullscreen = false;
    } catch (error) {
      console.warn("Could not exit fullscreen:", error);
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !isFullscreen) {
      event.preventDefault();
      enterFullscreen();
    } else if (event.key === "Escape" && isFullscreen) {
      event.preventDefault();
      exitFullscreen();
    }
  };

  // Listen for fullscreen change events
  const handleFullscreenChange = () => {
    isFullscreen = !!document.fullscreenElement;
  };
</script>

<svelte:window on:fullscreenchange={handleFullscreenChange} on:keydown={handleKeydown} />

<main class="flex flex-col relative w-screen h-screen overflow-hidden">
  <div
    tabindex="0"
    role="button"
    class="jt-section-title text-[2.5rem] pl-4 flex items-center uppercase cursor-pointer"
    class:jt-section-title--with-bg={isNotHomePage}
    onclick={navigateHome}
    onkeyup={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        navigateHome();
      }
    }}
  >
    Just Transitions
  </div>
  {#if !isNotHomePage}
    <div
      class="jt-section-subtitle absolute top-[2.5rem] left-[2.2rem] text-right"
    >
      <p class="jt-section-subtitle uppercase text-[2.5rem]">In The Delta</p>
      <p class="jt-section-body text-[1.4rem]/2 font-light">
        Drought, salinity, and sea-level rise
      </p>
    </div>
  {/if}
  <Router {routes} />
</main>

<style lang="postcss">
  @reference "tailwindcss";
  main {
    min-height: 100vh;
    display: flex;
    background-color: var(--surface-elevated);
  }
  .jt-section-title {
    color: var(--brand-primary);
    font-family: var(--sc-title);
    font-weight: 400;
    background-color: var(--surface-elevated);
  }
  .jt-section-subtitle {
    color: var(--brand-primary);
    font-family: var(--sc-title);
  }
  .jt-section-body {
    color: var(--brand-primary);
    font-family: var(--body-content);
  }
</style>
