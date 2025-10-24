<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { server_address } from "./constant";
  import SunburstChart from "./SunburstChart.svelte";
  import { enableDragToScroll } from "../dragToScroll";

  // Type definitions
  interface SunburstData {
    name: string;
    value?: number;
    children?: SunburstData[];
  }

  interface LegendItem {
    name: string;
    color: string;
  }

  interface TooltipData {
    visible: boolean;
    x: number;
    y: number;
    title: string;
    name: string;
    value: number;
    percentage: number;
  }

  interface SunburstDataWithTitle {
    data: SunburstData;
    title: string;
    filename: string;
  }

  // Helper function to generate titles from filenames
  function generateTitle(filename: string): string {
    // Remove "sunburst_" prefix and ".json" suffix
    let title = filename.replace("sunburst_", "").replace(".json", "");

    // Handle specific cases
    if (title === "age_18_35") return "Ages 18-35";
    if (title === "age_36_64") return "Ages 36-64";
    if (title === "age_65_plus") return "Ages 65+";
    if (title === "years_0_10_experience") return "Years 0-10 Engagement";
    if (title === "years_11_30_experience") return "Years 11-30 Engagement";
    if (title === "years_31_plus_experience") return "Years 31+ Engagement";
    if (title === "Resident") return "Resident";
    if (title === "Non Resident") return "Non Resident";
    if (title === "team") return "Team";
    if (title === "interviewees") return "Interviewees";
    if (title === "all") return "All MMs";

    // Fallback: capitalize and replace underscores with spaces
    return title.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Color palette
  const colorPalette = [
    "#637CEF",
    "#E3008C",
    "#2AA0A4",
    "#9373C0",
    "#13A10E",
    "#3A96DD",
    "#CA5010",
    "#57811B",
    "#B146C2",
    "#AE8C00",
  ];

  // Component state
  let sunburstDatasets: SunburstDataWithTitle[] = $state([]);
  let isTop5Mode = $state(true);
  let globalColorMap = $state(new Map<string, string>());
  let legendItems: LegendItem[] = $state([]);
  let showScrollIndicator = $state(true);
  let scrollPanelContainer: HTMLDivElement;
  let tooltip: TooltipData = $state({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    name: "",
    value: 0,
    percentage: 0,
  });

  // Reactive statements
  let processedDatasets: SunburstDataWithTitle[] = $derived(
    isTop5Mode
      ? sunburstDatasets.map((item) => ({
          ...item,
          data: filterToTop5(item.data),
        }))
      : sunburstDatasets
  );

  $effect(() => {
    if (processedDatasets.length > 0) {
      updateGlobalColorMapAndLegend();
    }
  });

  onMount(async () => {
    await loadData();
    enableDragToScroll();

    // Add scroll event listener to hide indicator when at bottom
    const handleScroll = () => {
      const scrollTop = scrollPanelContainer.scrollTop;
      const documentHeight = scrollPanelContainer.scrollHeight;
      const windowHeight = scrollPanelContainer.clientHeight;

      // Hide indicator when scrolled to within 100px of bottom
      showScrollIndicator = scrollTop + windowHeight < documentHeight - 100;
      console.log("Scroll position:", {
        scrollTop,
        documentHeight,
        windowHeight,
        showScrollIndicator,
      });
    };

    scrollPanelContainer.addEventListener("scroll", handleScroll);

    // Cleanup event listener
    // return () => {
    //   window.removeEventListener("scroll", handleScroll);
    // };
  });

  async function loadData() {
    // Fetch all sunburst data at once
    const response = await fetch(`${server_address}/data/`);
    const allData = await response.json();

    console.log("Loaded sunburst data:", allData);

    // Define the desired order based on dataFiles list
    const desiredOrder = [
      "sunburst_age_18_35.json",
      "sunburst_age_36_64.json",
      "sunburst_years_0_10_experience.json",
      "sunburst_years_31_plus_experience.json",
      "sunburst_team.json",
      "sunburst_interviewees.json",
    ];

    // Convert the data object to an array with titles
    const unsortedDatasets = Object.entries(allData).map(
      ([filename, data]) => ({
        data: data as SunburstData,
        title: generateTitle(filename),
        filename: filename,
      })
    );

    // Sort according to the desired order
    sunburstDatasets = desiredOrder
      .map((orderedFilename) =>
        unsortedDatasets.find((dataset) => dataset.filename === orderedFilename)
      )
      .filter((dataset) => dataset !== undefined) // Remove any missing files
      .concat(
        // Add any files not in the desired order at the end
        unsortedDatasets.filter(
          (dataset) => !desiredOrder.includes(dataset.filename)
        )
      );
  }

  function resetColorMap() {
    globalColorMap.clear();
  }

  function getConsistentColor(
    name: string,
    depth = 0,
    parentColor: string | null = null
  ): string {
    const key = `${name}_${depth}`;

    if (!globalColorMap.has(key)) {
      if (depth === 1 || !parentColor) {
        const colorIndex =
          Array.from(globalColorMap.keys()).filter((k) => k.endsWith("_1"))
            .length % colorPalette.length;
        globalColorMap.set(key, colorPalette[colorIndex]);
      } else {
        const baseColor = d3.color(parentColor);
        if (baseColor) {
          const variations = [baseColor.brighter(0.8)];
          const siblingIndex = Array.from(globalColorMap.keys()).filter(
            (k) =>
              k.includes(`_${depth}`) &&
              globalColorMap
                .get(k)
                ?.toString()
                .includes(baseColor.formatHex().substring(1, 3))
          ).length;
          const selectedVariation =
            variations[siblingIndex % variations.length];
          globalColorMap.set(key, selectedVariation.toString());
        }
      }
    }
    return globalColorMap.get(key) || colorPalette[0];
  }

  function filterToTop5(data: SunburstData): SunburstData {
    if (!data.children || data.children.length <= 5) {
      return data;
    }

    const sortedChildren = [...data.children]
      .sort(
        (a, b) =>
          (d3.sum(b.children || [], (d: SunburstData) => d.value || 0) || 0) -
          (d3.sum(a.children || [], (d: SunburstData) => d.value || 0) || 0)
      )
      .slice(0, 5);

    return {
      ...data,
      children: sortedChildren,
    };
  }

  function collectCategoryNames(
    node: SunburstData,
    depth = 0,
    parentColor: string | null = null
  ) {
    if (node.name) {
      const color = getConsistentColor(node.name, depth, parentColor);
      if (node.children) {
        node.children.forEach((child) =>
          collectCategoryNames(child, depth + 1, color)
        );
      }
    }
  }

  function updateGlobalColorMapAndLegend() {
    resetColorMap();

    processedDatasets.forEach((item) => {
      collectCategoryNames(item.data);
    });

    // Create legend items from the color map
    const parentCategories = new Map<string, string>();
    processedDatasets.forEach((item) => {
      if (item.data.children) {
        item.data.children.forEach((child) => {
          if (!parentCategories.has(child.name)) {
            const color = getConsistentColor(child.name, 1);
            parentCategories.set(child.name, color);
          }
        });
      }
    });

    legendItems = Array.from(parentCategories.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, color]) => ({ name, color }));
  }
  function handleShowTooltip(
    event: CustomEvent<{
      event: MouseEvent;
      title: string;
      data: any;
      value: number;
      percentage: number;
    }>
  ) {
    console.log("Tooltip event detail:", event.detail);
    const {
      event: mouseEvent,
      title: chartTitle,
      data,
      value,
      percentage,
    } = event.detail;
    tooltip = {
      visible: true,
      x: mouseEvent.pageX + 10,
      y: mouseEvent.pageY - 10,
      title: chartTitle,
      name: data.name,
      value,
      percentage,
    };
  }

  function handleHideTooltip() {
    tooltip = {
      ...tooltip,
      visible: false,
    };
  }
</script>

<div
  bind:this={scrollPanelContainer}
  class="min-h-screen bg-[var(--surface-page)] font-body overflow-y-auto relative flex px-4 text-white"
>
  <!-- <div class="absolute right-4 top-[20rem]">
    Some descriptive text/caption can be put here
  </div> -->
  <div class=" px-5 py-5 grow">
    <!-- <h1 class="text-3xl text-gray-800 mb-8 text-center">Sunburst Gallery</h1> -->
    <div
      class="max-w-[40rem] bg-[var(--surface-elevated)] p-4 rounded-lg mb-6 shadow-md outline-2 outline-[var(--brand-primary)]"
    >
      Here we can compare the different themes present in the mental models
      across different populations. You can compare differences across team
      members and interviewees, different years of engagement in the delta,
      residents and non residents, and different ages.
    </div>

    <!-- Controls -->
    <div class="fixed top-5 right-5 bg-white rounded-lg shadow-md p-4 z-50">
      <div class="flex items-center gap-3 text-gray-800">
        <span class="text-sm">Show Top 5 Only:</span>
        <label class="relative inline-block w-12 h-6">
          <input
            type="checkbox"
            bind:checked={isTop5Mode}
            class="opacity-0 w-0 h-0"
          />
          <span
            class="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition-all duration-300 rounded-full slider"
          >
            <span
              class="absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition-all duration-300 rounded-full transform {isTop5Mode
                ? 'translate-x-6'
                : ''}"
            ></span>
          </span>
        </label>
      </div>
    </div>

    <!-- Gallery -->
    <div class="flex flex-col gap-8 mb-8">
      {#each Array.from( { length: Math.ceil(processedDatasets.length / 2) }, (_, i) => processedDatasets.slice(i * 2, i * 2 + 2) ) as rowData, rowIndex}
        <div class="flex flex-col gap-4">
          <!-- Row of two sunbursts -->
          <div class="flex justify-center gap-8">
            <!-- Descriptive text for this row -->
            <div
              class="max-w-4xl flex-1 mx-auto bg-[var(--surface-elevated)] p-4 rounded-lg shadow-md"
            >
              <div class="text-left">
                {#if rowIndex === 0}
                  <h2>Age Group</h2>
                  <p class="text">
                    Compare mental model themes between <span class="underline"
                      >{rowData[0]?.title || ""}</span
                    >
                    and
                    <span class="underline">{rowData[1]?.title || ""}</span>.
                    The total number of nodes for participants aged 18-35 had on
                    average less subthemes than the 36-64 age group and 65 years
                    and older group.
                    <span class="underline">
                      This suggests that mental models become more detailed or
                      developed with increasing age.
                    </span>
                    The most mentioned theme in the mental models is human impacts.
                    The most mentioned driver of salinity was flow for the older
                    groups and structure (physical geography) for the younger groups.
                  </p>
                {:else if rowIndex === 1}
                  <h2>Experience of Engagement</h2>
                  <p class="text">
                    The visualization above shows how engagement experience
                    affects mental model composition.
                    <span class="underline">{rowData[0]?.title || ""}</span>
                    versus
                    <span class="underline">{rowData[1]?.title || ""}</span>
                    reveals how different levels of engagement influence the themes
                    people focus on. The mental models of people with 0-10 years
                    of experience had fewer subthemes on average than the mental
                    models of people with over 30 years of experience.
                    <span class="underline">
                      This suggests that as engagement in the delta increases,
                      individuals learn more about the system and their
                      conceptualizations of salinity become deeper and broader
                      as well.
                    </span>
                  </p>
                {:else if rowIndex === 2}
                  <h2>Team vs Interviewee</h2>
                  <p class="text">
                    On average team members had 12 subthemes in their mental
                    models, in comparison interviewees had 20 subthemes on
                    average. The top drivers of salinity in the delta for both
                    groups were flow and policy and regulation. In contrast,
                    climate change appears as the most identified theme in only
                    the team mental models.

                    <!-- <strong>{rowData[0]?.title || ""}</strong> and
                    <strong>{rowData[1]?.title || ""}</strong> show how different
                    generational perspectives influence the themes that emerge in
                    mental models. -->
                  </p>
                {:else}
                  <p class="text">
                    Additional comparison between <strong
                      >{rowData[0]?.title || ""}</strong
                    >
                    and <strong>{rowData[1]?.title || ""}</strong>. Each
                    visualization reveals unique patterns in how different
                    groups conceptualize and prioritize various themes.
                  </p>
                {/if}
              </div>
            </div>
            {#each rowData as item, index}
              <div class="flex-2" style={`z-index: ${rowData.length - index};`}>
                <SunburstChart
                  data={item.data}
                  title={item.title}
                  index={rowIndex * 2 + index}
                  {colorPalette}
                  {globalColorMap}
                />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Tooltip -->
    {#if tooltip.visible}
      <div
        class="fixed bg-black bg-opacity-80 text-white p-2 rounded text-xs pointer-events-none z-50"
        style="left: {tooltip.x}px; top: {tooltip.y}px;"
      >
        <div>{tooltip.title}</div>
        <br />
        <div>{tooltip.name}</div>
        <br />
        Value: {tooltip.value}<br />
        Percentage: {tooltip.percentage}%<br />
      </div>
    {/if}

    <!-- Legend -->
    <!-- <div class="bg-white rounded-lg shadow-md p-5">
      <div class="text-lg text-gray-800 mb-4 text-center">Color Legend</div>
      <div class="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
        {#each legendItems as item}
          <div class="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded">
            <div
              class="w-4 h-4 rounded border border-gray-300"
              style="background-color: {item.color};"
            ></div>
            <span class="text-sm text-gray-700">{item.name}</span>
          </div>
        {/each}
      </div>
    </div> -->
    <div class="h-[5rem]"></div>
  </div>

  <!-- Scroll indicator arrow -->
  {#if showScrollIndicator}
    <div class="scroll-indicator">
      <div class="w-8 h-8 bg-[var(--brand-primary)] p-1 rounded">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#333333"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-arrow-down-from-line-icon lucide-arrow-down-from-line"
          ><path d="M19 3H5" /><path d="M12 21V7" /><path
            d="m6 15 6 6 6-6"
          /></svg
        >
      </div>
      <span class="scroll-label text-[var(--brand-primary)]"
        >scroll down for more</span
      >
    </div>
  {/if}
</div>

<style>
  .slider {
    background-color: var(--surface-page);
  }

  input:checked + .slider {
    background-color: var(--jt-primary);
  }
  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .scroll-indicator {
    position: fixed;
    bottom: 2rem;
    left: 3rem;
    opacity: 0.8;
    pointer-events: none;
    z-index: 10;
    transition: opacity 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .scroll-label {
    /* color: white; */
    font-size: 0.875rem;
    font-weight: 400;
    white-space: nowrap;
  }

  /* Optional: Hide the arrow when at the bottom of the page */
  @media (max-height: 800px) {
    .scroll-indicator {
      opacity: 0.6;
    }
  }
</style>
