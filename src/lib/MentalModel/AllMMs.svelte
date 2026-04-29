<script lang="ts">
  import { onMount } from "svelte";
  import { MentalModelRenderer } from "./renderers/MentalModelRenderer";
  let {
    codebook,
    code_tsne,
    svgId,
    server_data,
    selected_code = $bindable(),
    tooltip_y = $bindable(),
  }: {
    codebook: any;
    code_tsne: Record<string, number>;
    svgId: string;
    server_data: any;
    selected_code?: string | undefined;
    tooltip_y?: number | undefined;
  } = $props();
  let bubble_renderer: MentalModelRenderer;
  let parent_dict = $derived(
    codebook.reduce((acc, code) => {
      acc[code.name] = code.parent;
      return acc;
    }, {}),
  );

  $effect(() => {
    if (!server_data) return;
    let render_data = Object.keys(server_data).reduce((acc, code) => {
      let parent_code = parent_dict[code];
      if (parent_code === "N/A") {
        parent_code = code; // If no parent, use the code itself
      }
      if (!acc[parent_code]) {
        acc[parent_code] = [];
      }
      acc[parent_code] = Array.from(
        new Set(acc[parent_code].concat(server_data[code])),
      );
      return acc;
    }, {});
    render_data = Object.keys(render_data).reduce((acc, code) => {
      acc[code] = render_data[code].length;
      return acc;
    }, {});
    console.log("Mental Models:", render_data);
    bubble_renderer.update(render_data, codebook, code_tsne);
  });
  function handleHover(node: [string, number] | null, clientY?: number) {
    selected_code = node ? node[0] : undefined;
    tooltip_y = node ? clientY : undefined;
  }

  onMount(() => {
    bubble_renderer = new MentalModelRenderer(svgId, handleHover);
    bubble_renderer.init();
  });
</script>

<div id="MM" class="grow">
  <svg id={svgId} class="w-full h-full"></svg>
</div>
