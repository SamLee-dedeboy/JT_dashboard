<script lang="ts">
  import { push } from "svelte-spa-router";
</script>

<div class="home-container">
  <h1>JT Dashboard</h1>
  <p>Welcome to the Just Transition Dashboard</p>

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
  }

  h1 {
    color: #646cff;
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 3rem;
    color: rgba(255, 255, 255, 0.87);
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
    background: linear-gradient(135deg, #646cff 0%, #535bf2 100%);
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(100, 108, 255, 0.3);
  }

  .nav-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(100, 108, 255, 0.4);
    background: linear-gradient(135deg, #535bf2 0%, #646cff 100%);
  }

  .nav-button:active {
    transform: translateY(0);
  }

  @media (prefers-color-scheme: light) {
    p {
      color: #213547;
    }
  }
</style>
