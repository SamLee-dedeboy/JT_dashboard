<script lang="ts">
  interface Props {
    onclick: () => void;
    label?: string;
    class?: string;
  }
  let {
    onclick,
    label = "Toggle info panel",
    class: className = "",
  }: Props = $props();
</script>

<button
  type="button"
  class="info-button {className}"
  aria-label={label}
  {onclick}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
</button>

<style lang="postcss">
  .info-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: none;
    background-color: color-mix(
      in srgb,
      var(--surface-elevated) 92%,
      transparent
    );
    color: var(--text-primary);
    outline: 1px solid var(--border-subtle);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: filter 0.15s;
    flex-shrink: 0;
  }
  .info-button:hover {
    filter: brightness(1.15);
  }
</style>
