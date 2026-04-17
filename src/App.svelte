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
  <header
    class="app-hero"
    class:app-hero--compact={isNotHomePage}
    role="button"
    tabindex="0"
    onclick={navigateHome}
    onkeyup={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        navigateHome();
      }
    }}
  >
    <h1 class="app-hero__title">Just Transitions</h1>
    {#if !isNotHomePage}
      <h2 class="app-hero__subtitle">In The Delta</h2>
      <p class="app-hero__tagline">Drought, salinity, and sea-level rise</p>
    {/if}
  </header>
  <Router {routes} />
</main>

<style lang="postcss">
  @reference "tailwindcss";
  main {
    min-height: 100vh;
    display: flex;
    background-color: var(--surface-elevated);
  }

  /* Unified hero: all routes render <h1>Just Transitions</h1>; home adds
     "In The Delta" + tagline. Right-justified block — all lines share a
     right edge so they read as one headline. Natural flex flow (no absolute
     positioning) so the Router area naturally gets the remaining height. */
  .app-hero {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    padding: 0.75rem 2rem 1.5rem;
    background-color: var(--surface-elevated);
    cursor: pointer;
  }
  .app-hero--compact {
    padding-bottom: 0.75rem;
  }

  .app-hero__title,
  .app-hero__subtitle {
    color: var(--brand-primary);
    font-family: var(--sc-title);
    font-weight: 400;
    font-size: 2.5rem;
    line-height: 1;
    text-transform: uppercase;
    margin: 0;
  }

  .app-hero__tagline {
    color: var(--brand-primary);
    font-family: var(--body-content);
    font-size: 1.4rem;
    font-weight: 300;
    line-height: 1.2;
    margin: 0.25rem 0 0;
  }
</style>
