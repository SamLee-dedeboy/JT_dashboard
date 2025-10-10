<script lang="ts">
  import { push } from "svelte-spa-router";
</script>

<div class="home-container">
  <!-- <h1>JT Dashboard</h1> -->
  <p class="text-3xl">Welcome to the Just Transition Interview Dashboard</p>

  <div class="timeline-container">
    <div class="timeline-line"></div>

    <!-- Timeline Item 1 - Left side: description -- content -->
    <div class="timeline-item left">
      <div class="timeline-side">
        <div class="timeline-description">
          <p>Initial phase of public opinion collection</p>
        </div>
        <div class="timeline-content">
          <button class="nav-button" on:click={() => push("/flow")}>
            Flow
          </button>
        </div>
      </div>
      <div class="timeline-dot">
        <div class="timeline-date">2023</div>
      </div>
    </div>

    <!-- Timeline Item 2 - Right side: content -- description -->
    <div class="timeline-item right">
      <div class="timeline-dot">
        <div class="timeline-date">Early 2024</div>
      </div>
      <div class="timeline-side">
        <div class="timeline-content">
          <button class="nav-button" on:click={() => push("/linking")}>
            Linking
          </button>
        </div>
        <div class="timeline-description">
          <p>Connecting public opinion to scenarios</p>
        </div>
      </div>
    </div>

    <!-- Timeline Item 3 - Left side: description -- content -->
    <div class="timeline-item left">
      <div class="timeline-side">
        <div class="timeline-description">
          <p>Identifying mental models in public opinion</p>
        </div>
        <div class="timeline-content">
          <button class="nav-button" on:click={() => push("/mental-model")}>
            Mental Model
          </button>
        </div>
      </div>
      <div class="timeline-dot">
        <div class="timeline-date">2025</div>
      </div>
    </div>

    <!-- Timeline Item 4 - Right side: content -- description -->
    <div class="timeline-item right">
      <div class="timeline-dot">
        <div class="timeline-date">Summer 2025</div>
      </div>
      <div class="timeline-side">
        <div class="timeline-content">
          <button class="nav-button" on:click={() => push("/sunburst")}>
            Sunburst
          </button>
        </div>
        <div class="timeline-description">
          <p>Comparing mental models across groups</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  .home-container {
    padding: 2rem;
    text-align: center;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: var(--sc-title);
  }
  .home-container p {
    margin-bottom: 3rem;
    color: var(--brand-secondary);
    /* font-family: var(--brand-primary); */
  }

  .timeline-container {
    position: relative;
    /* max-width: 800px; */
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .timeline-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(
      to bottom,
      var(--brand-secondary) 0%,
      var(--accent-info) 100%
    );
    transform: translateX(-50%);
    z-index: 1;
  }

  .timeline-item {
    position: relative;
    margin-bottom: 4rem;
    display: flex;
    align-items: center;
    min-height: 120px;
    width: 100%;
  }

  .timeline-item.left > .timeline-side {
    right: calc(50% + 30px);
    /* justify-content: flex-end; */
    /* margin-right: calc(50% + 30px); */
  }
  .timeline-item.left .timeline-date {
    left: 0;
    transform: translateX(30px);
  }
  .timeline-item.right > .timeline-side {
    left: calc(50% + 30px);
  }
  .timeline-item.right .timeline-date {
    right: 0;
    transform: translateX(-30px);
  }

  .timeline-side {
    /* max-width: 300px; */
    position: absolute;
    /* width: 100%; */
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
  }

  .timeline-content {
    display: flex;
    justify-content: center;
  }

  .timeline-description {
    padding: 0.75rem;
    background: rgba(67, 197, 255, 0.1);
    border-radius: 8px;
    font-family: var(--font-family-body);
    /* border-left: 3px solid var(--brand-primary); */
  }

  .timeline-description p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .timeline-dot {
    position: absolute;
    left: 50%;
    width: 20px;
    height: 20px;
    /* background: var(--brand-primary); */
    background: var(--brand-secondary);
    border: 4px solid var(--brand-secondary);
    /* border: 4px solid var(--bg-primary); */
    border-radius: 50%;
    transform: translateX(-50%);
    z-index: 2;
    box-shadow: 0 0 3px var(--brand-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .timeline-date {
    position: absolute;
    /* top: 0px; */
    font-size: 1rem;
    font-weight: bold;
    color: var(--brand-secondary);
    text-align: center;
    white-space: nowrap;
    /* width: 80px; */
    /* left: 50%; */
  }

  .nav-button {
    padding: 1.5rem 2rem;
    font-size: 1.3rem;
    font-weight: 600;
    border-radius: 12px;
    font-family: var(--sc-title);
    /* background: linear-gradient(
      135deg,
      var(--brand-primary) 0%,
      var(--accent-info) 100%
    ); */
    background: transparent;
    color: var(--button-text);
    /* color: var(--text-) */
    /* border: 1px solid var(--brand-primary); */
    cursor: pointer;
    transition: all 0.3s ease;
    /* box-shadow: 0 4px 15px rgba(67, 197, 255, 0.3); */
    /* box-shadow: 0 2px 10px var(--brand-primary); */
    box-shadow: 0 2px 10px var(--jt-secondary);
    animation: pulse-shadow 3s ease-in-out infinite;
  }

  @keyframes pulse-shadow {
    0%,
    100% {
      box-shadow: 0 2px 10px var(--jt-secondary);
    }
    50% {
      box-shadow:
        0 4px 20px var(--jt-secondary),
        0 0 15px rgba(67, 197, 255, 0.4);
    }
  }

  /* Staggered animation delays for each timeline item */
  .timeline-item:nth-child(2) .nav-button {
    animation-delay: 0.75s;
  }

  .timeline-item:nth-child(3) .nav-button {
    animation-delay: 1.5s;
  }

  .timeline-item:nth-child(4) .nav-button {
    animation-delay: 2.25s;
  }

  .timeline-item:nth-child(5) .nav-button {
    animation-delay: 3s;
  }

  /* .nav-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(67, 197, 255, 0.4);
    background: linear-gradient(
      135deg,
      var(--accent-success) 0%,
      var(--brand-primary) 100%
    );
  } */

  .nav-button:active {
    transform: translateY(0);
  }

  @media (prefers-color-scheme: light) {
    p {
      color: var(--text-primary);
    }
  }

  @media (max-width: 768px) {
    .timeline-container {
      max-width: 100%;
      padding: 0 1rem;
    }

    .timeline-line {
      left: 30px;
    }

    .timeline-item.left,
    .timeline-item.right {
      justify-content: flex-start;
      padding-left: 60px;
      padding-right: 0;
    }

    .timeline-side {
      max-width: 100%;
    }

    .timeline-dot {
      left: 30px;
    }

    .timeline-date {
      left: 30px;
      transform: translateX(-50%);
    }

    .nav-button {
      font-size: 1.1rem;
      padding: 1.2rem 1.5rem;
    }
  }
</style>
