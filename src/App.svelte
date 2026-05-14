<script lang="ts">
  import Router, { push, location } from "svelte-spa-router";
  import Home from "./lib/Home.svelte";
  import MentalModel from "./lib/MentalModel/MentalModel.svelte";
  import Sunburst from "./lib/Sunburst/Sunburst.svelte";
  import Linking from "./lib/Linking/Linking.svelte";
  import Flow from "./lib/Flow/Flow.svelte";
  import InfoButton from "./lib/InfoButton.svelte";
  import { fade } from "svelte/transition";

  const routes = {
    "/": Home,
    "/flow": Flow,
    "/linking": Linking,
    "/mental-model": MentalModel,
    "/sunburst": Sunburst,
  };

  type PageInfo = {
    title: string;
    subtitle: string;
    body: string;
    hint: string;
  };
  const pageInfo: Record<string, PageInfo> = {
    "/flow": {
      title: "Listening",
      subtitle: "Understanding Public Values and Concerns",
      body: "Our process began by interviewing Delta residents, community organizers, Indigenous community members, farmers, scientists, experts and agency officials. Key questions we asked interviewees were what they most value about the Delta, what factors are driving change, what adaptation strategies are most useful to explore, and who is and isn't represented in Delta planning efforts.",
      hint: "Explore the results and connections across the interview data",
    },
    "/linking": {
      title: "Designing",
      subtitle: "From Ideas and Values to Scenarios",
      body: "With a rich understanding of participant values, the drivers of change, and the management and adaptation strategies prioritized across a range of interviewees, we used this information as the foundation for the design of six distinct scenarios.",
      hint: "Explore how interviews shaped the design of each scenario",
    },
    "/mental-model": {
      title: "Conceptualizing",
      subtitle: "Shared Understandings of Delta Salinity",
      body: 'Throughout the project we have been documenting how project participants conceptualize and understand salinity and salinity management in the Delta. We collected these "mental models" through interviews and our public workshops and exhibitions.',
      hint: "Explore shared understandings of drivers and impacts of Delta Salinity",
    },
    "/sunburst": {
      title: "Comparing",
      subtitle: "Different Mental Models",
      body: "We then took the interview and public mental models a step further by comparing them across a range of demographic and other category types. We observed similarities and differences between a variety of groups, including comparisons across age, experience, Delta resident or non-resident, and research team members compared to participants.",
      hint: "Explore how mental models differ across participants",
    },
  };

  const navigateHome = () => push("/");

  let isNotHomePage = $derived($location !== "/");
  let currentPage = $derived<PageInfo | null>(pageInfo[$location] ?? null);

  let page_modal_open = $state(false);
  $effect(() => {
    // open the modal whenever navigating to a content page
    if ($location && pageInfo[$location]) page_modal_open = true;
  });

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

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !isFullscreen) {
      event.preventDefault();
      enterFullscreen();
    } else if (event.key === "Escape" && page_modal_open) {
      event.preventDefault();
      page_modal_open = false;
    }
  };
</script>

<svelte:window on:keydown={handleKeydown} />

{#if page_modal_open && currentPage}
  <div
    class="modal-backdrop"
    role="button"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
    onclick={() => (page_modal_open = false)}
    onkeyup={() => {}}
  >
    <div
      class="modal-box"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeyup={() => {}}
    >
      <!-- <h2 class="modal-title">{currentPage.title}</h2>
      <p class="modal-subtitle">{currentPage.subtitle}</p>
      <p class="modal-body">{currentPage.body}</p>
      <p class="modal-cta">{currentPage.hint}</p> -->
      <!-- <hr class="modal-divider" /> -->
      <div class="modal-tutorial">
        {#if $location === "/flow"}
          <h3 class="modal-tutorial-title">How to use this interface</h3>
          <div class="modal-tutorial-body">
            <p>
              Three common questions we asked participants in interviews were:
            </p>
            <ol>
              <li>
                What should Future Salinity Management Strategies focus on?
              </li>
              <li>What are the Drivers of Change?</li>
              <li>Is the current decision making Fair?</li>
            </ol>
            <p>
              Answer the questions yourself by clicking the blocks and see how
              many participants agree with you!
            </p>
            <p>
              Each block represents a category of public opinion. Connected
              blocks represent public opinion from the same group of people.
            </p>
            <p>
              Color of connections represent different groups of people, defined
              by participants' responses to <em
                >"What should be the Future Salinity Management Strategies?"</em
              >
            </p>
            <!-- <p>
              Tip: Click nodes column-by-column to see public opinion patterns.
            </p> -->
          </div>
        {:else if $location === "/linking"}
          <h3 class="modal-tutorial-title">How to use this interface</h3>
          <div class="modal-tutorial-body">
            <p>
              This interactive section illustrates how the results of interviews
              informed and guided the design of the project’s future adaptation
              scenarios.
            </p>
            <p>
              Select a scenario from the left column to open a description of
              that scenario and a diagram of public values and concerns included
              in the scenario. You can zoom in and out of the diagram and hover
              over any of the bubble categories to see how many participants
              mentioned this interest and to read more detailed information
              about how this topic was discussed in interviews.
            </p>
            <!-- <p>Tip: TBD.</p> -->
          </div>
        {:else if $location === "/mental-model"}
          <h3 class="modal-tutorial-title">How to read these Mental Models</h3>
          <div class="modal-tutorial-body">
            <p>
              This collective mental model combines and visualizes how interview
              and workshop participants collectively responded to the following
              questions:
            </p>
            <ol>
              <li>
                What factors do you think have the most influence on Delta
                salinity management?
              </li>
              <li>What is most at risk if salinity increases in the Delta?</li>
            </ol>
            <p>
              Results have been organized into themes and symbolized from large
              to small based on the number of times they are mentioned by
              participants.
            </p>
            <p>
              This collective mental model enables us to see shared
              understandings in how participants perceive drivers and impacts of
              Delta Salinity.
            </p>
            <p class="italic">Tip: Hover over a node to view the data.</p>
          </div>
        {:else if $location === "/sunburst"}
          <h3 class="modal-tutorial-title">
            Comparing mental models across populations
          </h3>
          <div class="modal-tutorial-body">
            <p>
              Here we can compare the different themes present in the mental
              models across different populations. You can see differences
              across team members and interviewees, different years of
              engagement in the delta, residents and non residents, and
              different ages.
            </p>
            <p>
              Tip: click different segments of the wheels to see more on what
              this concept was in participants' mental model.
            </p>
          </div>
        {/if}
      </div>
      <button
        class="modal-close"
        onclick={() => (page_modal_open = false)}
        aria-label="Close">✕</button
      >
    </div>
  </div>
{/if}

<main
  class="flex flex-col relative w-screen h-screen overflow-y-auto lg:overflow-hidden"
>
  <header class="app-hero h-[60px]" class:app-hero--compact={isNotHomePage}>
    {#if isNotHomePage && currentPage}
      <div class="app-hero__page-info">
        <InfoButton
          onclick={() => (page_modal_open = !page_modal_open)}
          label="About this section"
        />
        <div class="app-hero__page-text">
          <span class="app-hero__page-title">{currentPage.title}</span>
          <span class="app-hero__page-subtitle">{currentPage.subtitle}</span>
        </div>
      </div>
    {/if}
    <div class="app-hero__brand">
      <span class="app-hero__title">
        <button
          type="button"
          class="app-hero__title-button"
          title="Back to home"
          onclick={navigateHome}
        >
          Just Transitions in the Delta
          {#if isNotHomePage}
            <span class="app-hero__title-back">← Back to home</span>
          {:else}
            <span class="app-hero__title-back">&nbsp;</span>
            <!-- <p class="app-hero__tagline">
              Drought, salinity, and sea-level rise
            </p> -->
          {/if}
        </button>
      </span>
      <!-- <h2 class="app-hero__subtitle">In The Delta</h2> -->
    </div>
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

  .app-hero {
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: column;
    text-align: right;
    padding: 0.75rem 2rem 0rem 2rem;
    margin-bottom: 1rem;
    background-color: var(--surface-elevated);
    border-bottom: 3px solid var(--border-subtle);
  }

  .app-hero--compact {
    flex-direction: row;
    /* align-items: center; */
    justify-content: space-between;
    /* padding-bottom: 0.75rem; */
  }

  /* ---- Left: page info ---- */
  .app-hero__page-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .app-hero__page-text {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 0.75rem;
  }

  .app-hero__page-title {
    font-family: var(--font-display);
    font-size: 1.875rem;
    font-weight: 400;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    line-height: 1.1;
  }

  .app-hero__page-subtitle {
    font-family: var(--font-body);
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--jt-green);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wider);
    line-height: 1.2;
  }

  /* ---- Right: brand ---- */
  .app-hero__brand {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .app-hero__title-button {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    font: inherit;
    line-height: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    cursor: pointer;
    text-align: right;
    opacity: 0.85;
    transition: opacity 0.2s ease;
  }
  .app-hero__title-button:hover {
    opacity: 1;
  }

  .app-hero__title-back {
    display: block;
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: var(--tracking-wider);
    text-transform: uppercase;
    color: var(--text-tertiary);
    opacity: 0.7;
    margin-top: 0.2rem;
    transition:
      opacity 0.2s ease,
      color 0.2s ease;
  }
  .app-hero__title-button:hover .app-hero__title-back {
    opacity: 1;
    color: var(--jt-green);
  }

  .app-hero__title,
  .app-hero__subtitle {
    color: var(--brand-primary);
    font-family: var(--sc-title);
    font-weight: 400;
    font-size: 1.2rem;
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

  /* ---- Modal ---- */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-box {
    position: relative;
    background: var(--surface-page);
    border: 1px dashed var(--jt-green);
    max-width: 500px;
    max-height: 85vh;
    width: 90%;
    padding: 4rem 3rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow-y: auto;
  }

  .modal-title {
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
  }

  .modal-subtitle {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--jt-green);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wider);
    margin: 0;
  }

  .modal-body {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .modal-cta {
    font-family: var(--font-body);
    font-size: 1rem;
    font-style: italic;
    color: var(--jt-blue);
    margin: 0;
  }

  .modal-close {
    position: absolute;
    top: 0.6rem;
    right: 0.75rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1rem;
    cursor: pointer;
    line-height: 1;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  .modal-close:hover {
    opacity: 1;
  }

  .modal-divider {
    border: none;
    border-top: 1px dashed var(--border-subtle);
    margin: 0;
  }

  .modal-tutorial {
    text-align: left;
  }

  .modal-tutorial-title {
    color: var(--text-primary);
    margin-bottom: 0.75rem;
  }

  .modal-tutorial-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  .modal-tutorial-body p,
  .modal-tutorial-body ol,
  .modal-tutorial-body ul {
    margin: 0;
  }
  .modal-tutorial-body ol,
  .modal-tutorial-body ul {
    padding-left: 1.25rem;
  }
  .modal-tutorial-tip {
    font-style: italic;
    opacity: 0.8;
  }
</style>
