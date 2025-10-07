<script lang="ts">
  import { push } from "svelte-spa-router";
</script>

<div class="home-container">
  <!-- <h1>JT Dashboard</h1> -->
  <p class="text-3xl">Welcome to the Just Transition Interview Dashboard</p>

  <div class="buttons-container">
    <button class="nav-button" on:click={() => push("/mental-model")}>
      Mental Model
    </button>

    <button class="nav-button" on:click={() => push("/sunburst")}>
      Sunburst
    </button>

    <button class="nav-button" on:click={() => push("/linking")}>
      Linking
    </button>
    <button class="nav-button" on:click={() => push("/flow")}> Flow </button>
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

  h1 {
    color: var(--brand-primary);
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 3rem;
    color: var(--text-primary);
  }

  .buttons-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 400px;
    width: 100%;
  }

  .nav-button {
    padding: 1.5rem 2rem;
    font-size: 1.3rem;
    font-weight: 600;
    border-radius: 12px;
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
    box-shadow: 0 2px 10px var(--brand-primary);
  }

  .nav-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(67, 197, 255, 0.4);
    background: linear-gradient(
      135deg,
      var(--accent-success) 0%,
      var(--brand-primary) 100%
    );
  }

  .nav-button:active {
    transform: translateY(0);
  }

  @media (prefers-color-scheme: light) {
    p {
      color: var(--text-primary);
    }
  }
</style>
