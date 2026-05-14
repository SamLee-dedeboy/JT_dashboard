<script lang="ts" module>
  let visited = false;
</script>

<script lang="ts">
  import { push } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import InfoButton from "./InfoButton.svelte";

  let modal_open = $state(!visited);
  visited = true;
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape" && modal_open) {
      e.preventDefault();
      modal_open = false;
    }
  }}
/>

{#if modal_open}
  <div
    class="modal-backdrop"
    role="button"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
    onclick={() => (modal_open = false)}
    onkeyup={() => {}}
  >
    <div
      class="modal-box"
      role="dialog"
      aria-modal="true"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- <div class="modal-accent-bar"></div> -->
      <h2 class="modal-title">Welcome to the<br />Co-Learning Dashboard</h2>
      <p class="modal-body">
        This site offers interactive opportunities to explore how the Just
        Transitions in the Delta research project has prioritized and responded
        to public engagement through a participatory scenario planning process
      </p>
      <p class="modal-cta">Click one of the modules to get started</p>
      <button
        class="modal-close"
        onclick={() => (modal_open = false)}
        aria-label="Close">✕</button
      >
    </div>
  </div>
{/if}

<InfoButton
  onclick={() => (modal_open = !modal_open)}
  label="About this dashboard"
  class="info-btn-fixed"
/>

<div class="home-container">
  <header class="welcome-header gap-8">
    <h1 class="welcome-title">Welcome to the Co-Learning Dashboard</h1>
    <p class="welcome-subtitle">
      <!-- This site offers interactive opportunities to explore how the Just
      transitions in the Delta research project has prioritized and responded to
      public engagement through a participatory scenario planning process. -->
      “What is co-learning”? Co-learning is a collaborative process in which researchers,
      community members, and other partners learn from one another by sharing knowledge,
      experiences, and perspectives to jointly understand issues and develop solutions.
      It recognizes that expertise exists both inside and outside academia and values
      mutual learning throughout the research process
    </p>
  </header>

  <div class="timeline-container">
    <div class="timeline-line"></div>

    <!-- Timeline Item 1 - Left -->
    <div class="timeline-item left">
      <div class="timeline-side">
        <button class="timeline-card" onclick={() => push("/flow")}>
          <h3 class="card-title">Listening</h3>
          <h4 class="card-subtitle">
            UNDERSTANDING PUBLIC <br /> VALUES and CONCERNS
          </h4>
          <p class="card-body">
            Our process began by interviewing Delta residents, community
            organizers, Indigenous community members, farmers, scientists,
            experts and agency officials. Key questions we asked interviewees
            included what they most value about the Delta, what factors they
            believe drive change, what salinity adaptation strategies they are
            most interested in seeing explored, and who is and isn’t represented
            in Delta planning efforts.
          </p>
          <p class="card-hint">
            Click to explore the results and connections across the interview
            data
          </p>
        </button>
      </div>
      <div class="timeline-dot">
        <div class="timeline-date">2023</div>
      </div>
    </div>

    <!-- Timeline Item 2 - Right -->
    <div class="timeline-item right">
      <div class="timeline-dot">
        <div class="timeline-date">Early 2024</div>
      </div>
      <div class="timeline-side">
        <button class="timeline-card" onclick={() => push("/linking")}>
          <h3 class="card-title">Designing</h3>
          <h4 class="card-subtitle">
            FROM IDEAS and VALUES <br /> TO SCENARIOS
          </h4>
          <p class="card-body">
            With a better understanding of interviewee's perceived drivers of
            change, management and adaptation strategies to explore, and values
            and priorities, we designed six distinct scenarios.
          </p>
          <p class="card-hint">
            Click to explore how interviews shaped the design of each scenario
          </p></button
        >
      </div>
    </div>

    <!-- Timeline Item 3 - Left -->
    <div class="timeline-item left">
      <div class="timeline-side">
        <button class="timeline-card" onclick={() => push("/mental-model")}>
          <h3 class="card-title">CONCEPTUALIZING</h3>
          <h4 class="card-subtitle">SHARED UNDERSTANDINGS OF DELTA SALINITY</h4>
          <p class="card-body">
            Leveraging these interviews and data collected through our public
            workshops, we have been documenting how project participants
            conceptualize and understand salinity and salinity management in the
            Delta, as well as how those understandings change over time. These
            are visualized as “mental models” which are representations of how
            people understand a system, concept, or process works.
          </p>
          <p class="card-hint">Click to see these mental models</p>
        </button>
      </div>
      <div class="timeline-dot">
        <div class="timeline-date">2025</div>
      </div>
    </div>

    <!-- Timeline Item 4 - Right -->
    <div class="timeline-item right">
      <div class="timeline-dot">
        <div class="timeline-date">Summer 2025</div>
      </div>
      <div class="timeline-side">
        <button class="timeline-card" onclick={() => push("/sunburst")}>
          <h3 class="card-title">Comparing</h3>
          <h4 class="card-subtitle">DIFFERENT MENTAL MODELS</h4>
          <p class="card-body">
            We then compare how the mental models are similar and different
            across different groups of people, including across age, years of
            engagement in the Delta, Delta resident or non-resident, and
            research team members compared to research participants.
          </p>
          <p class="card-hint">
            Click to explore how mental models differ across participants
          </p>
        </button>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  :global(.info-btn-fixed) {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 100;
  }

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
    /* border-radius: 8px; */
    max-width: 500px;
    width: 90%;
    padding: 4rem 3rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow: hidden;
  }

  .modal-title {
    color: var(--text-primary);
  }

  .modal-body {
    font-family: var(--font-body);
    font-size: 1.2rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .modal-cta {
    font-family: var(--font-body);
    font-size: 1.1rem;
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

  .home-container {
    padding: 2rem;
    text-align: center;
    /* Fill the remaining height below the "Just Transitions" title inside
       <main h-screen overflow-hidden>, and scroll internally so the
       timeline cards don't get clipped. min-height: 0 is required for a
       flex child to be smaller than its content (i.e. to actually scroll). */
    flex: 1 1 0;
    min-height: 0;
    width: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    font-family: var(--font-body);
  }

  .welcome-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
  }

  .welcome-title {
    color: var(--text-primary);
  }

  .welcome-subtitle {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5;
    /* color: var(--text-secondary); */
    max-width: 700px;
    margin: 0;
    text-align: center;
  }

  .timeline-container {
    position: relative;
    width: 100%;
    max-width: 1100px;
    margin-top: 5rem;
    display: flex;
    flex-direction: column;
  }

  .timeline-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 3px;
    /* background: linear-gradient(
      to bottom,
      var(--jt-blue) 0%,
      var(--jt-green) 100%
    ); */
    background: var(--jt-blue);
    transform: translateX(-50%);
    z-index: 1;
  }

  /* 3-col grid: [left card] [rail] [right card]. Each timeline-item
     is one row; its children claim specific columns. Cards size the
     row naturally so nothing overflows its neighbors. */
  .timeline-item {
    display: grid;
    grid-template-columns: 1fr 60px 1fr;
    align-items: center;
    width: 100%;
    /* margin-bottom: 4rem; */
  }

  /* Interleave cards: every item after the first pulls itself up by ~50%
     of a typical card's height so left- and right-side cards sit halfway
     above/below each other. Tunable via the --timeline-overlap var on
     .timeline-container if card heights change. */
  .timeline-container {
    --timeline-overlap: 3rem;
  }
  .timeline-item + .timeline-item {
    margin-top: calc(-1 * var(--timeline-overlap));
  }

  .timeline-item.left > .timeline-side {
    grid-column: 1;
    justify-self: end;
    padding-right: 1.5rem;
  }

  .timeline-item.right > .timeline-side {
    grid-column: 3;
    justify-self: start;
    padding-left: 1.5rem;
  }

  .timeline-side {
    display: flex;
    align-items: center;
  }

  .timeline-item.left .timeline-date {
    left: calc(100% + 10px);
  }

  .timeline-item.right .timeline-date {
    right: calc(100% + 10px);
  }

  /* ---- Combined card (nav button + description in one box) ---- */
  .timeline-card {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    width: 100%;
    max-width: 440px;
    padding: 2rem 2.25rem;
    text-align: center;
    background: var(--surface-page);
    border: 2px solid var(--jt-blue);
    border-radius: 6px;
    cursor: pointer;
    color: inherit;
    font-family: var(--font-body);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      border-color 0.25s ease;
    box-shadow: 0 2px 10px rgba(81, 162, 189, 0.35);
    animation: pulse-shadow 3s ease-in-out infinite;
  }

  .timeline-card:hover {
    transform: translateY(-2px);
    border-color: var(--jt-blue-light);
    box-shadow: 0 8px 24px rgba(81, 162, 189, 0.45);
  }

  .timeline-card:active {
    transform: translateY(0);
  }

  .card-title {
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    font-family: "Hammersmith One", serif;
  }

  .card-subtitle {
    color: var(--jt-green);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    margin: 0 0 0.25rem;
  }

  .card-body {
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 400;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }
  .card-hint {
    color: var(--text-subtitle);
    font-style: italic;
    font-weight: 100;
    font-size: 0.85rem;
  }

  /* Stagger the pulse across items so they don't breathe in unison */
  .timeline-item:nth-child(2) .timeline-card {
    animation-delay: 0.75s;
  }
  .timeline-item:nth-child(3) .timeline-card {
    animation-delay: 1.5s;
  }
  .timeline-item:nth-child(4) .timeline-card {
    animation-delay: 2.25s;
  }
  .timeline-item:nth-child(5) .timeline-card {
    animation-delay: 3s;
  }

  @keyframes pulse-shadow {
    0%,
    100% {
      box-shadow: 0 2px 10px rgba(81, 162, 189, 0.35);
    }
    50% {
      box-shadow:
        0 4px 20px rgba(81, 162, 189, 0.55),
        0 0 15px rgba(126, 217, 87, 0.25);
    }
  }

  /* ---- Timeline dot & date ---- */
  .timeline-dot {
    grid-column: 2;
    justify-self: center;
    align-self: center;
    position: relative;
    width: 20px;
    height: 20px;
    background: white;
    /* border: 1px solid var(--jt-green); */
    border-radius: 50%;
    z-index: 2;
    /* box-shadow: 0 0 3px var(--jt-blue); */
  }

  .timeline-date {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    font-weight: 600;
    color: var(--jt-green);
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .timeline-container {
      max-width: 100%;
      padding: 0 1rem;
    }

    /* Collapse to [rail | content]. Rail hugs the left edge. */
    .timeline-item {
      grid-template-columns: 60px 1fr;
    }

    .timeline-line {
      left: 30px;
    }

    .timeline-item.left > .timeline-side,
    .timeline-item.right > .timeline-side {
      grid-column: 2;
      justify-self: stretch;
      padding-left: 1rem;
      padding-right: 0;
    }

    .timeline-item .timeline-dot {
      grid-column: 1;
    }

    .timeline-item.left .timeline-date,
    .timeline-item.right .timeline-date {
      left: calc(100% + 10px);
      right: auto;
    }

    .timeline-card {
      max-width: 100%;
      padding: 1.5rem;
    }

    .card-title {
      font-size: 1.4rem;
    }

    .card-subtitle {
      font-size: 0.95rem;
    }
  }
</style>
