<script lang="ts">
  import { push } from "svelte-spa-router";
</script>

<div class="home-container">
  <header class="welcome-header">
    <h1 class="welcome-title">Welcome to the Co-Learning Dashboard</h1>
    <p class="welcome-subtitle">
      This site offers interactive opportunities to explore how the Just
      transitions in the Delta research project has prioritized and responded to
      public engagement through a participatory scenario planning process.
    </p>
  </header>

  <div class="timeline-container">
    <div class="timeline-line"></div>

    <!-- Timeline Item 1 - Left -->
    <div class="timeline-item left">
      <div class="timeline-side">
        <button class="timeline-card" on:click={() => push("/flow")}>
          <h3 class="card-title">Listening</h3>
          <h4 class="card-subtitle">
            UNDERSTANDING PUBLIC VALUES and CONCERNS
          </h4>
          <p class="card-body">
            We started our co-learning process by interviewing Delta residents,
            community organizers, Indigenous community members, farmers,
            scientists, and agency officials. This first phase focused on public
            opinions and values, along with overall perceptions of the Delta. We
            asked interviewees what drives change in the Delta to reveal how
            people understand and prioritize these factors.
          </p>
          <p class="card-hint">
            Click to explore how we developed connections across our interview
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
        <button class="timeline-card" on:click={() => push("/linking")}>
          <h3 class="card-title">Designing</h3>
          <h4 class="card-subtitle">FROM IDEAS and VALUES TO SCENARIOS</h4>
          <p class="card-body">
            With a rich understanding of participant values, the drivers of
            change, and the management strategies held across a range of
            interviewees, we then applied these perceptions to the design of six
            distinct scenarios. Each scenario draws from interview responses to
            weave public opinions and priorities into the co-design of
            adaptation strategies and features for each potential future.
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
        <button class="timeline-card" on:click={() => push("/mental-model")}>
          <h3 class="card-title">ORGANIZING</h3>
          <h4 class="card-subtitle">A LARGER MENTAL MODEL</h4>
          <p class="card-body">
            Third, we began organizing larger concepts based on the various
            topics identified in the interviews. We nested these topics into and
            defined themes that altogether helped us understand the "mental
            models" of our participants. We divided these mental models into two
            groups: 1) What drives change in relation to salinity? and 2) What
            does salinity impact?
          </p>
          <p class="card-hint">
            Click to explore salinity drivers and impacts within this mental
            model
          </p>
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
        <button class="timeline-card" on:click={() => push("/sunburst")}>
          <h3 class="card-title">Comparing</h3>
          <h4 class="card-subtitle">DIFFERENT MENTAL MODELS</h4>
          <p class="card-body">
            We then took the interview and public mental models a step further
            by comparing them across a range of demographic categories. We
            observed similarities and differences between a variety of groups.
            These groups include comparisons of age, experience, Delta resident
            or non-resident, and research team members or not.
          </p>
          <p class="card-hint">
            Click to explore how mental models differ across demographic
            categories
          </p>
        </button>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";

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
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 2.25rem;
    line-height: 1.2;
    color: var(--text-primary);
    /* margin: 0 0 0.75rem; */
  }

  .welcome-subtitle {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5;
    /* color: var(--text-secondary); */
    max-width: 900px;
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
    /* font-family: var(--font-display); */
    font-family: var(--font-body);
    font-size: 1.75rem;
    font-weight: 400;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    line-height: 1.1;
    margin: 0;
  }

  .card-subtitle {
    /* font-family: var(--font-display); */
    font-family: var(--font-body);
    font-size: 1.05rem;
    font-weight: 400;
    color: var(--jt-green);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    line-height: 1.2;
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
    background: var(--jt-blue);
    border: 4px solid var(--jt-blue);
    border-radius: 50%;
    z-index: 2;
    box-shadow: 0 0 3px var(--jt-blue);
  }

  .timeline-date {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    font-weight: 600;
    color: var(--jt-blue);
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
