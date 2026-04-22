<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import * as d3 from "d3";
  import { server_address } from "./constant";

  // Type definitions
  type SunburstData = {
    name: string;
    value?: number;
    children?: SunburstData[];
  };

  interface HierarchyNodeExtended extends d3.HierarchyNode<SunburstData> {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  }

  // Props
  let {
    data,
    title,
    index,
    colorPalette,
    globalColorMap,
  }: {
    data: any; // SunburstData
    title: string;
    index: number;
    colorPalette: string[];
    globalColorMap: Map<string, string>;
  } = $props();

  // Event dispatcher for tooltip events

  // Internal state
  let svgElement: SVGSVGElement | null = $state(null);
  let mounted = $state(false);

  // Zoom state
  let zoomedParent: HierarchyNodeExtended | null = $state(null);
  let isZoomed = $state(false);

  // Modal state for code definitions
  let showModal = $state(false);
  let modalCodeData: any = $state(null);
  let isLoadingCode = $state(false);
  // Used to ignore stale async responses when the user hovers quickly off or
  // onto another segment while a fetch is still in flight.
  let hoveredCode: string | null = $state(null);
  // Color of the currently hovered segment; used to tint the tooltip so it
  // reads as belonging to that slice.
  let hoveredColor: string = $state("var(--brand-primary)");
  // Every other chart in the row is on the right side of its row; offset the
  // hover tooltip to the side with more space.
  let isLeftChart = $derived(index % 2 === 0);

  // Reactive variables for rendering
  $effect(() => {
    if (mounted && data && svgElement) {
      renderSunburst();
    }
  });

  onMount(() => {
    mounted = true;
  });

  function getConsistentColor(
    name: string,
    depth = 0,
    parentColor: string | null = null,
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
                .includes(baseColor.formatHex().substring(1, 3)),
          ).length;
          const selectedVariation =
            variations[siblingIndex % variations.length];
          globalColorMap.set(key, selectedVariation.toString());
        }
      }
    }
    return globalColorMap.get(key) || colorPalette[0];
  }

  function getHierarchicalColor(d: HierarchyNodeExtended) {
    let parentColor: string | null = null;
    if (d.parent && d.parent.data.name) {
      parentColor = getConsistentColor(d.parent.data.name, d.depth - 1);
    }
    return getConsistentColor(d.data.name, d.depth, parentColor);
  }

  function getContrastColor(backgroundColor: string) {
    const rgb = d3.rgb(backgroundColor);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  async function fetchCodeDefinition(codeName: string) {
    isLoadingCode = true;
    try {
      const response = await fetch(`${server_address}/code/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code_name: codeName }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch code definition: ${response.status}`);
      }
      const codeData = await response.json();
      // Discard stale responses if the user has hovered off / onto a new segment.
      if (hoveredCode !== codeName) return;
      modalCodeData = codeData;
      showModal = true;
    } catch (error) {
      console.error("Error fetching code definition:", error);
      if (hoveredCode !== codeName) return;
      modalCodeData = {
        name: codeName,
        error: "Failed to load code definition",
        details: error instanceof Error ? error.message : "Unknown error",
      };
      showModal = true;
    } finally {
      if (hoveredCode === codeName) isLoadingCode = false;
    }
  }

  function renderSunburst() {
    if (!svgElement || !data) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 10;

    // Clear previous render
    d3.select(svgElement).selectAll("*").remove();

    const hiddenChildren = new Set<string>();

    function initializeHiddenState() {
      if (data.children) {
        const parentsWithTotals = data.children.map((parent) => ({
          name: parent.name,
          totalValue: parent.children
            ? d3.sum(parent.children, (d: SunburstData) => d.value || 0)
            : 0,
        }));

        const top5Parents = parentsWithTotals
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, 5)
          .map((p) => p.name);

        data.children.forEach((parent) => {
          if (!top5Parents.includes(parent.name) && parent.children) {
            parent.children.forEach((child) => {
              const childKey = `${parent.name}_${child.name}`;
              hiddenChildren.add(childKey);
            });
          }
        });
      }
    }

    initializeHiddenState();

    const arc = d3
      .arc<HierarchyNodeExtended>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1);

    const outerArc = d3
      .arc<HierarchyNodeExtended>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y1 + 72)
      .outerRadius((d) => d.y1 + 75);

    const partition = d3.partition<SunburstData>().size([2 * Math.PI, radius]);
    console.log({ data });

    const root = d3
      .hierarchy(data)
      .sum((d) => d.value || 0)
      // Alphabetical by name so the same top-level category sits in the same
      // angular slot across every sunburst in the gallery.
      .sort((a, b) => d3.ascending(a.data?.name ?? "", b.data?.name ?? ""));

    partition(root);
    console.log({ root });

    const extendedRoot = root as HierarchyNodeExtended;

    // If we're zoomed, adjust only the radii to focus on the selected parent
    if (isZoomed && zoomedParent) {
      // Calculate original thickness and inner radius ratio for the parent
      const originalInnerRadius = zoomedParent.y0;
      const originalOuterRadius = zoomedParent.y1;

      // Scale all radii by 1.5x and reposition for quarter-circle view
      const scaleFactor = 1.65;
      const scaledInnerRadius = originalInnerRadius * scaleFactor;
      const scaledOuterRadius = originalOuterRadius * scaleFactor;

      // Adjust radii for the zoomed view - keep angles unchanged
      extendedRoot.descendants().forEach((node: any) => {
        if (node.data.name === zoomedParent?.data.name) {
          // Parent becomes the inner donut, scaled 2x
          node.y0 = scaledInnerRadius;
          node.y1 = scaledOuterRadius;
        } else if (node.parent?.data.name === zoomedParent?.data.name) {
          // Children fill the outer area, also scaled 2x
          node.y0 = scaledOuterRadius; // Children start after parent
          node.y1 = node.y1 * scaleFactor; // Scale children's outer radius too
        }
        // Keep original angles (x0, x1) unchanged for all nodes
      });
    }

    // Calculate the new origin when zoomed
    let translateX = width / 2;
    let translateY = height / 2;

    if (isZoomed && zoomedParent) {
      // Calculate the center of the arc
      const arcCenterAngle = (zoomedParent.x0 + zoomedParent.x1) / 2;
      const arcCenterRadius = (zoomedParent.y0 + zoomedParent.y1) / 2;

      // Arc center position relative to original SVG center
      const arcCenterX = Math.sin(arcCenterAngle) * arcCenterRadius + width / 2;
      const arcCenterY =
        -Math.cos(arcCenterAngle) * arcCenterRadius + height / 2;

      // SVG center is at (width/2, height/2) in SVG coordinates
      const svgCenterX = width / 2;
      const svgCenterY = height / 2;

      // Direction vector from arc center to SVG center
      const directionX = svgCenterX - arcCenterX;
      const directionY = svgCenterY - arcCenterY;

      // Normalize the direction vector
      const directionLength = Math.sqrt(
        directionX * directionX + directionY * directionY,
      );
      const normalizedDirX = directionX / directionLength;
      const normalizedDirY = directionY / directionLength;

      // Find intersection with canvas border
      // Check intersection with each border and find the closest one
      let intersectionX, intersectionY;
      const intersections: { x: number; y: number; distance: number }[] = [];

      // Left border (x = 0)
      if (normalizedDirX < 0) {
        const t = -arcCenterX / normalizedDirX;
        const y = arcCenterY + t * normalizedDirY;
        if (y >= 0 && y <= height) {
          intersections.push({ x: 0, y, distance: t });
        }
      }

      // Right border (x = width)
      if (normalizedDirX > 0) {
        const t = (width - arcCenterX) / normalizedDirX;
        const y = arcCenterY + t * normalizedDirY;
        if (y >= 0 && y <= height) {
          intersections.push({ x: width, y, distance: t });
        }
      }

      // Top border (y = 0)
      if (normalizedDirY < 0) {
        const t = -arcCenterY / normalizedDirY;
        const x = arcCenterX + t * normalizedDirX;
        if (x >= 0 && x <= width) {
          intersections.push({ x, y: 0, distance: t });
        }
      }

      // Bottom border (y = height)
      if (normalizedDirY > 0) {
        const t = (height - arcCenterY) / normalizedDirY;
        const x = arcCenterX + t * normalizedDirX;
        if (x >= 0 && x <= width) {
          intersections.push({ x, y: height, distance: t });
        }
      }

      // Find the closest intersection
      if (intersections.length > 0) {
        const closestIntersection = intersections.reduce((closest, current) =>
          current.distance < closest.distance ? current : closest,
        );

        // Use offset factor e to control position on the line
        const offsetFactor = 1; // e between 0 and 1

        // Calculate new origin position
        translateX =
          arcCenterX + offsetFactor * (closestIntersection.x - arcCenterX);
        translateY =
          arcCenterY +
          (offsetFactor * (closestIntersection.y - arcCenterY)) / 1.25;
      }
    }

    const g = d3
      .select(svgElement)
      .append("g")
      .attr("transform", `translate(${translateX}, ${translateY})`);

    function updateVisibility() {
      arcs.style("display", function (d: HierarchyNodeExtended) {
        if (d.depth <= 1) return "block";
        // When zoomed, never hide children
        if (isZoomed) return "block";
        const parentName = d.parent?.data.name;
        if (!parentName) return "block";
        const childKey = `${parentName}_${d.data.name}`;
        return hiddenChildren.has(childKey) ? "none" : "block";
      });

      labels.style("display", function (d: HierarchyNodeExtended) {
        if (d.depth <= 1) return "block";
        // When zoomed, never hide children labels
        if (isZoomed) return "block";
        const parentName = d.parent?.data.name;
        if (!parentName) return "block";
        const childKey = `${parentName}_${d.data.name}`;
        return hiddenChildren.has(childKey) ? "none" : "block";
      });

      outerArcs.style("display", function (d: HierarchyNodeExtended) {
        if (d.depth !== 1 || !d.children) return "none";
        const hasVisibleChildren = d.children.some((child) => {
          const childKey = `${d.data.name}_${child.data.name}`;
          return !hiddenChildren.has(childKey);
        });
        return hasVisibleChildren ? "block" : "none";
      });

      countLabels
        .style("display", function (d: HierarchyNodeExtended) {
          if (d.depth !== 1 || !d.children) return "none";
          const hasVisibleChildren = d.children.some((child) => {
            const childKey = `${d.data.name}_${child.data.name}`;
            return !hiddenChildren.has(childKey);
          });
          return hasVisibleChildren ? "block" : "none";
        })
        .text(function (d: HierarchyNodeExtended) {
          if (!d.children) return "0";
          const visibleChildren = d.children.filter((child) => {
            const childKey = `${d.data.name}_${child.data.name}`;
            return !hiddenChildren.has(childKey);
          }).length;
          return visibleChildren;
        });
    }

    console.log(extendedRoot.descendants());
    const filteredDescendants = extendedRoot.descendants().filter((d) => {
      if (isZoomed && zoomedParent) {
        console.log(zoomedParent, d);
        return (
          d.data.name === zoomedParent.data.name ||
          d.parent?.data.name === zoomedParent.data.name
        );
      }
      return d.depth > 0;
    });
    console.log(filteredDescendants);
    const arcs = g
      .selectAll("path")
      .data(filteredDescendants)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => getHierarchicalColor(d))
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .style("cursor", (d) => {
        if (isZoomed) {
          // In zoomed mode, the parent (inner circle) is clickable for zoom out
          // and children are clickable for code definitions
          return d.data.name === zoomedParent?.data.name || d.depth > 1
            ? "pointer"
            : "default";
        }
        return d.depth === 1 && d.children && d.children.length > 0
          ? "pointer"
          : "default";
      })
      .on("mouseover", function (event: MouseEvent, d: HierarchyNodeExtended) {
        d3.select(this).style("opacity", 0.8).style("stroke-width", 3);
        if (d.depth > 1) {
          hoveredCode = d.data.name;
          hoveredColor = getHierarchicalColor(d);
          isLoadingCode = true;
          modalCodeData = { name: d.data.name };
          showModal = true;
          fetchCodeDefinition(d.data.name);
        }
      })
      .on("mouseout", function (event: MouseEvent, d: HierarchyNodeExtended) {
        d3.select(this).style("opacity", 1).style("stroke-width", 1.5);
        if (d.depth > 1 && hoveredCode === d.data.name) {
          hoveredCode = null;
          showModal = false;
          modalCodeData = null;
          isLoadingCode = false;
        }
      })
      .on("click", function (event: MouseEvent, d: HierarchyNodeExtended) {
        if (!isZoomed && d.depth === 1 && d.children && d.children.length > 0) {
          zoomedParent = d;
          isZoomed = true;
          renderSunburst();
        } else if (isZoomed && d.data.name === zoomedParent?.data.name) {
          zoomedParent = null;
          isZoomed = false;
          renderSunburst();
        }
      });

    const outerArcs = g
      .selectAll(".outer-arc")
      .data(
        extendedRoot
          .descendants()
          .filter(
            (d) =>
              !isZoomed && d.depth === 1 && d.children && d.children.length > 0,
          ) as HierarchyNodeExtended[],
      )
      .enter()
      .append("path")
      .attr("class", "outer-arc")
      .attr("d", outerArc)
      .attr("fill", (d) => {
        const baseColor = getHierarchicalColor(d);
        const darkColor = d3.color(baseColor);
        return darkColor ? darkColor.darker(0.3).toString() : baseColor;
      })
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("opacity", 0.7);

    const countLabels = g
      .selectAll(".count-label")
      .data(
        extendedRoot
          .descendants()
          .filter(
            (d) =>
              !isZoomed && d.depth === 1 && d.children && d.children.length > 0,
          ) as HierarchyNodeExtended[],
      )
      .enter()
      .append("text")
      .attr("class", "count-label")
      .attr("transform", function (d: HierarchyNodeExtended) {
        const angle = (d.x0 + d.x1) / 2;
        const radius = d.y1 + 85;
        const x = Math.sin(angle) * radius;
        const y = -Math.cos(angle) * radius;
        return `translate(${x},${y}) rotate(0)`;
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "10px")
      .style("fill", "white")
      .style("pointer-events", "none")
      .text((d: HierarchyNodeExtended) => {
        if (!d.children) return "0";
        const visibleChildren = d.children.filter((child) => {
          const childKey = `${d.data.name}_${child.data.name}`;
          return !hiddenChildren.has(childKey);
        }).length;
        return visibleChildren;
      });

    let labels = g
      .selectAll("text.arc-text")
      .data(
        extendedRoot.descendants().filter((d) => {
          const node = d as HierarchyNodeExtended;
          if (isZoomed && zoomedParent) {
            // In zoomed mode, show labels for the zoomed parent and its children
            return (
              node.data.name === zoomedParent?.data.name ||
              node.parent?.data.name === zoomedParent?.data.name
              // &&
              // node.x1 - node.x0 > 0.0
            );
          }
          return node.depth > 0 && node.depth <= 2 && node.x1 - node.x0 > 0.1;
        }) as HierarchyNodeExtended[],
      )
      .enter()
      .append("text")
      .attr("class", "arc-text")
      .attr("transform", function (d: HierarchyNodeExtended) {
        const angle = (d.x0 + d.x1) / 2;
        const radius = (d.y0 + d.y1) / 2;
        const x = Math.sin(angle) * radius;
        const y = -Math.cos(angle) * radius;

        let rotationAngle = (angle * 180) / Math.PI - 90;

        if (rotationAngle > 90) {
          rotationAngle -= 180;
        } else if (rotationAngle < -90) {
          rotationAngle += 180;
        }

        return `translate(${x},${y}) rotate(${rotationAngle})`;
      })
      .attr("dy", "0.35em")
      .style("font-size", (d: HierarchyNodeExtended) => {
        const arcAngle = d.x1 - d.x0; // Arc angle in radians

        // Create a linear scale for font size based on arc angle
        const fontScale = d3
          .scaleLinear()
          .domain([0, Math.PI * 2]) // Full circle in radians
          .range([8, 16]) // Font size range from 8px to 14px
          .clamp(true);

        return `${fontScale(arcAngle)}px`;
      })
      .style("fill", (d: HierarchyNodeExtended) =>
        getContrastColor(getHierarchicalColor(d)),
      )
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .text((d: HierarchyNodeExtended) => {
        if (isZoomed) {
          return d.data.name;
        } else if (d.x1 - d.x0 > 0.1) {
          return d.data.name;
          // return d.data.name.length > 18
          //   ? d.data.name.substring(0, 18) + "..."
          //   : d.data.name;
        }
        return "";
      })
      .call(wrap, isZoomed ? 100 : 60);

    // Add center indicator when in zoomed mode
    if (isZoomed) {
      // const zoom_out_hint = d3
      //   .select(svgElement)
      //   .append("text")
      //   .attr("text-anchor", "middle")
      //   .attr("x", width - 60)
      //   .attr("y", 20)
      //   // .attr("dy", "-2rem")
      //   .style("font-size", "12px")
      //   .style("fill", "#aaa")
      //   .style("pointer-events", "none");
      // zoom_out_hint
      //   .append("tspan")
      //   .attr("x", width - 60)
      //   .attr("dy", "-0.3em")
      //   .text("Click inner ring");
      // zoom_out_hint
      //   .append("tspan")
      //   .attr("x", width - 60)
      //   .attr("dy", "1.2em")
      //   .text("to zoom out");
    }

    const baseDelay = index * 500;

    // arcs
    //   .style("opacity", 0)
    //   .transition()
    //   .duration(1000)
    //   .delay((d, i) => baseDelay + i * 30)
    //   .style("opacity", 1);

    // outerArcs
    //   .style("opacity", 0)
    //   .transition()
    //   .duration(1000)
    //   .delay((d, i) => baseDelay + i * 30)
    //   .style("opacity", 0.7);

    // labels
    //   .style("opacity", 0)
    //   .transition()
    //   .duration(1000)
    //   .delay((d, i) => baseDelay + i * 30 + 300)
    //   .style("opacity", 1);

    // countLabels
    //   .style("opacity", 0)
    //   .transition()
    //   .duration(1000)
    //   .delay((d, i) => baseDelay + i * 30 + 300)
    //   .style("opacity", 1);

    setTimeout(() => {
      updateVisibility();
    }, 100);
  }
  function wrap(text, width) {
    text.each(function (d, i) {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        // words = text.text().split("").reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 0, //parseFloat(text.attr("dy")),
        hasTransform = text.attr("transform") !== null;

      var tspan;
      if (hasTransform) {
        // For transformed text, use relative positioning to avoid offset issues
        tspan = text
          .text(null)
          .append("tspan")
          .attr("dy", dy + "em")
          .attr("text-anchor", "bottom")
          .attr("dominant-baseline", "central");
      } else {
        // For non-transformed text, use absolute positioning as before
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em")
          .attr("text-anchor", "bottom")
          .attr("dominant-baseline", "central");
      }

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width && line.length > 1) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          if (hasTransform) {
            // For transformed text, use only dy for line spacing
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .attr("dy", lineHeight + "em")
              .attr("dominant-baseline", "central")
              .text(word);
          } else {
            // For non-transformed text, use absolute positioning
            tspan = text
              .append("tspan")
              .attr("x", x)
              .attr("y", y)
              // .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .attr("dy", lineHeight + "em")
              .attr("dominant-baseline", "central")
              .text(word);
          }
        }
      }

      if (!hasTransform) {
        // Only adjust y positioning for non-transformed text
        const line_num = text.selectAll("tspan").nodes().length;
        const em_to_px = 16;
        text
          .selectAll("tspan")
          .attr("y", +y - (em_to_px / 2) * lineHeight * (line_num - 1));
      } else {
        // For transformed text, center the text block vertically
        const line_num = text.selectAll("tspan").nodes().length;
        if (line_num > 1) {
          // Offset the first line to center the text block
          const centerOffset = (-(line_num - 1) * lineHeight) / 2;
          text.select("tspan").attr("dy", centerOffset + "em");
        }
      }
    });
  }
</script>

<div
  class="sunburst-container rounded-lg px-4 pb-4 pt-2 flex-1 flex flex-col items-center justify-center relative"
  style={showModal ? "z-index: 9999" : ""}
>
  <div class="sunburst-title text-lg mb-4 text-center flex items-center gap-3">
    {#if isZoomed}
      <button
        type="button"
        class="back-button flex items-center gap-1 rounded px-2 py-0.5 text-sm"
        aria-label="Back to overview"
        onclick={() => {
          zoomedParent = null;
          isZoomed = false;
          renderSunburst();
        }}
      >
        ← Back
      </button>
    {/if}
    <span>
      {isZoomed ? `${title} - ${zoomedParent?.data.name || ""}` : title}
    </span>
  </div>

  <svg bind:this={svgElement} overflow="visible" viewBox="0 0 400 400"></svg>

  <!-- Hover tooltip for code definitions; offset to the side with more space -->
  {#if showModal}
    <div
      class="hover-tooltip absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none"
      class:tooltip-right={isLeftChart}
      class:tooltip-left={!isLeftChart}
    >
      <div
        class="bg-[var(--surface-elevated)] rounded-lg shadow-xl w-[22rem] max-h-[32rem] overflow-hidden flex flex-col"
      >
        <div
          class="p-4"
          style={`background-color: ${hoveredColor}; color: ${getContrastColor(hoveredColor)};`}
        >
          <h2 class="text-lg">
            {modalCodeData?.name || "Loading..."}
          </h2>
        </div>
        <div class="p-4 overflow-y-auto text-white space-y-3">
          {#if isLoadingCode}
            <div class="flex items-center justify-center py-4">
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"
              ></div>
              <span class="ml-2 text-gray-300 text-sm">Loading…</span>
            </div>
          {:else if modalCodeData?.error}
            <div class="text-red-400">
              <p class="font-semibold">Error: {modalCodeData.error}</p>
              {#if modalCodeData.details}
                <p class="text-sm mt-2">{modalCodeData.details}</p>
              {/if}
            </div>
          {:else if modalCodeData}
            {#if modalCodeData.description}
              <div>
                <h3 class="mb-1 text-sm font-semibold opacity-80">
                  Description
                </h3>
                <p>{modalCodeData.description}</p>
              </div>
            {/if}
            {#if modalCodeData.definition}
              <div>
                <h3 class="mb-1 text-sm font-semibold opacity-80">
                  Definition
                </h3>
                <p>{modalCodeData.definition}</p>
              </div>
            {/if}
            {#if modalCodeData.parent}
              <div>
                <h3 class="mb-1 text-sm font-semibold opacity-80">Parent</h3>
                <p>{modalCodeData.parent}</p>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @media (max-width: 768px) {
    .sunburst-container {
      max-width: 100% !important;
    }
  }
  /* Position hover tooltip just outside the chart, on the side with more room. */
  .tooltip-right {
    left: 100%;
    margin-left: 0.75rem;
  }
  .tooltip-left {
    right: 100%;
    margin-right: 0.75rem;
  }
  .back-button {
    color: var(--text-primary);
    background-color: var(--surface-interactive);
    outline: 1px solid var(--border-subtle);
    cursor: pointer;
    transition: filter 0.15s;
  }
  .back-button:hover {
    filter: brightness(1.15);
  }
</style>
