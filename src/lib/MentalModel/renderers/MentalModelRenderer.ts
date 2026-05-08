import * as d3 from "d3"
import { contrastTextColor } from "../../../constants/colors"
import { colorForNode } from "../constants"
const center = 1.6/3;
export class MentalModelRenderer {
    svgId: string;
    width: number = 1000
    height: number = 1000
    dispatchHover: (node: [string, number] | null, clientY?: number) => void
    simulation: any
    constructor(
        svgId: string,
        dispatchHover: (node: [string, number] | null, clientY?: number) => void,
    ) {
        this.svgId = svgId
        this.dispatchHover = dispatchHover
    }

    init() {
        const svg = d3.select(`#${this.svgId}`)
        svg.append("defs")
            .append("marker")
            .attr("id", `mm-arrow-${this.svgId}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 10).attr("refY", 0)
            .attr("markerWidth", 6).attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#c3c3c3");
        const regions = svg.append("g").attr("class", "region")
        const links_group = svg.append("g").attr("class", "links_group")
        const bubble_group = svg.append("g").attr("class", "bubble_group")
        const labels_group = svg.append("g").attr("class", "labels_group")
        const contour_path_group = svg.append("g").attr("class", "contour-path-group")
        this.width = +svg.node().getBoundingClientRect().width
        this.height = +svg.node().getBoundingClientRect().height
        svg.attr("viewBox", `0 0 ${this.width} ${this.height}`)
        regions.append("rect").attr("class", "top_region")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", this.width)
          .attr("height", this.height* center)
          .attr("fill", "#cccccc")
          .attr("opacity", 0.1)
        regions.append("rect").attr("class", "bottom_region")
          .attr("x", 0)
          .attr("y", this.height* center)
          .attr("width", this.width)
          .attr("height", this.height* (1- center))
          .attr("fill", "#ffffff")
          .attr("opacity", 0.1)
        // regions.append("text").attr("class", "top_region_label")
        //   .classed("jt-body-3", true)
        //   .attr("x", this.width/2)
        //   .attr("y", 10)
        //   .attr("text-anchor", "middle")
        //   .attr("dominant-baseline", "hanging")
        //   .attr("font-size", 20)
        //   .attr("fill", "var(--bg-drivers)")
        //   .attr("pointer-events", "none")
        //   .attr("font-family", "monospace")
        //   .text("Factors that Drive Salinity")
        // regions.append("text").attr("class", "bottom_region_label")
        //   .classed("jt-body-3", true)
        //   .attr("x", this.width/2)
        //   .attr("y", this.height - 15)
        //   .attr("text-anchor", "middle")
        //   .attr("dominant-baseline", "bottom")
        //   .attr("font-size", 20)
        //     .attr("fill", "var(--bg-impacted)")
        //   .attr("pointer-events", "none")
        //   // .attr("font-family", "")
        //   .text("Factors Impacted by Salinity")
        svg.append("circle")
          .attr("class", "bubble")
          .classed("is_center", true)
          .attr("fill", "var(--brand-primary)")
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5)
          .attr("cx", this.width/2)
          .attr("cy", this.height * center)
          .attr("r", 55)
        svg.append("text")
          .attr("class", "bubble_label")
          .classed("jt-body-3", true)
          .attr("x", this.width/2)
          .attr("y", this.height * center)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-family", "'Hammersmith One', sans-serif")
          .attr("font-size", Math.max(8, Math.min(16, 65 * 0.3)))
          .attr("pointer-events", "none")
          .attr("fill", contrastTextColor("var(--brand-primary)"))
          .text("SALINITY")

    }

    update(_nodes_data: Record<string, number>, codebook: any[], code_tsne: Record<string, number>, callback=(d)=>{}) {
        const nodes_data = Object.entries(_nodes_data)
        const node_types = codebook.reduce((acc, item) => {
            acc[item.name] = item.type
            return acc
        }, {})
        // let nodes_data = JSON.parse(JSON.stringify(_nodes_data));
        // nodes_data["Salinity"] = 80;
        console.log("mental model data", nodes_data)
        const svg = d3.select(`#${this.svgId}`)
        const bubble_group = svg.select("g.bubble_group")
        const radiusScale = d3.scaleSqrt().domain([0, d3.max(nodes_data, d => d[1])]).range([20, 65])
        const nodes = nodes_data.concat([["Salinity", 80]])
        const classification_force_position_y = {
          "impacts salinity": this.height * center / 2,
          "impacted by salinity":  this.height * center + (this.height * (1 - center) / 2),
        }
        const circles = bubble_group.selectAll("circle")
          .data(nodes, (d) => d[0])
            .join(
              enter => enter.append("circle")
                .attr("class", "bubble")
                .classed("is_center", d => d[0] === "Salinity")
                .attr("fill", d => d[0] === "Salinity" ? "var(--brand-primary)" : colorForNode(node_types[d[0]]))
                .attr("stroke", "#333")
                .attr("stroke-width", 1.5)
                .attr("cursor", "pointer")
                .on("mouseover", (event, d) => {
                    const target = event.currentTarget as SVGCircleElement
                    d3.select(target)
                      .style("stroke", "#fff")
                      .style("stroke-width", "3px")
                    const rect = target.getBoundingClientRect()
                    this.dispatchHover(d, rect.top + rect.height / 2)
                })
                .on("mouseout", (event) => {
                    d3.select(event.currentTarget as SVGCircleElement)
                      .style("stroke", "#333")
                      .style("stroke-width", "1.5px")
                    this.dispatchHover(null)
                })
                .attr("cx", (d) => d.x = code_tsne[d[0]] * this.width || this.width/2)
                .attr("cy", (d) => d.y = classification_force_position_y[node_types[d[0]]] || this.height*center)
                .attr("r", 0)
                .transition().duration(300).delay(300)
                .attr("r", d => d.r = d[0] === "Salinity"? 55: radiusScale(d[1])),
              update => update
                .attr("fill", d => d[0] === "Salinity" ? "var(--brand-primary)" : colorForNode(node_types[d[0]]))
                .transition().duration(100)
                .attr("cx", (d) => d.x = code_tsne[d[0]] * this.width || this.width/2)
                .attr("cy", (d) => d.y = classification_force_position_y[node_types[d[0]]] || this.height*center)
                .attr("r", d => d.r = d[0] === "Salinity"? 55: radiusScale(d[1])),
              exit => exit.transition().duration(300).attr("r", 0).remove()
            )
        console.log(node_types, classification_force_position_y[node_types[nodes[1][0]]])
        const node_labels = svg.select("g.labels_group").selectAll("text")
            .data(nodes, (d) => d[0])
            .join("text")
            .attr("class", "bubble_label")
            .classed("jt-body-2", true)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-family", "'Hammersmith One', sans-serif")
            .attr("font-size", (d) => {
              const r = d[0] === "Salinity" ? 55 : radiusScale(d[1]);
              return Math.max(8, Math.min(20, r * 0.25)) + "px";
            })
            .attr("fill", (d) =>
              d[0] === "Salinity"
                ? contrastTextColor("var(--brand-primary)")
                : contrastTextColor(colorForNode(node_types[d[0]]))
            )
            .attr("pointer-events", "none")
            .text((d) => d[0])
            .each(function(d) {
              wrap(d3.select(this), d.r)
              const line_num = d3.select(this).selectAll("tspan").nodes().length
              d3.select(this).append("tspan")
                .text(`(${d[1]})`)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", d.x)
                .attr("y", d.y)
                .attr("dy", `-${((line_num+1)/2) * 1.2}em`)
            })
            // .each(function(d) {
            //   const text = d3.select(this);
            //   text.selectAll("*").remove();
            //   text.append("tspan")
            //     .text(d => d[0])
            //     .attr("text-anchor", "middle")
            //     .attr("dominant-baseline", "middle")
            //     .attr("x", d.x)
            //     .attr("y", d.y)
            //     .attr("dy", (d) => d[0] === "Salinity"? 0: "-0.6em")
            //     .attr("font-family", "monospace")
            //   if (d[0] === "Salinity") return
            //   text.append("tspan")
            //     .text(d => `(${d[1]})`)
            //     .attr("text-anchor", "middle")
            //     .attr("dominant-baseline", "middle")
            //     .attr("x", d.x)
            //     .attr("y", d.y)
            //     .attr("dy", "0.6em")
            // })

        const links = svg.select("g.links_group").selectAll("path.link")
            .data(nodes_data.filter(d => d[0] !== "Salinity"), (d) => d[0])
            .join("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .attr("stroke", "#c3c3c3")
            .attr("stroke-opacity", 0.5)
            .attr("marker-mid", `url(#mm-arrow-${this.svgId})`)
        const canvasRadiusScale = d3.scalePow().exponent(1/2).domain([d3.min(nodes_data, d => d[1]), d3.max(nodes_data, d => d[1])]).range([120, this.height])
        // update force
        const forceNode = d3.forceManyBody();
        this.simulation = d3
        .forceSimulation(nodes)
        // .alphaMin(0.3)
        .alphaMin(0.001)
        // .force("parent_x", d3.forceX((d) => d.parent_x).strength(0.1))  
        // .force("parent_y", d3.forceY((d) => d.parent_y).strength(0.1))
        // .force("tsne_x", d3.forceX((d) => code_tsne[d[0]] * this.width || this.width/2).strength(0.1))
        .force("clf_y", d3.forceY((d) => classification_force_position_y[node_types[d[0]]] || this.height * center).strength(0.1))
        // .force("center_x", d3.forceX(this.width/2).strength(0.02))
        // .force("center_y", d3.forceY(this.height*center).strength(0.01))
        .force("frequency_y", d3.forceRadial(null, this.width/2, this.height*center).radius((d) => canvasRadiusScale(d[1]) + 130).strength(0.2))
        // .force("clf_y", d3.forceY((d) => classification_force_position_y[node_types[d[0]]] || this.height * center).strength(0.08))
        // .force("center", d3.forceCenter(this.width / 2, this.height * center).strength(0.02))
        .force("charge", forceNode.distanceMin(20))
        .force("collide", d3.forceCollide((d) => 1.1*d.r).strength(0.5))
        // Boundary force: keep "impacts salinity" nodes above the center line
        // and "impacted by salinity" nodes below it. On each tick, clamp any
        // node that has crossed and zero out its y velocity so it doesn't
        // bounce. The Salinity center node is pinned to the line.
        .force("boundary", () => {
          const line = this.height * center;
          nodes.forEach((d: any) => {
            const r = d.r ?? 0;
            if (d[0] === "Salinity") return;
            const type = node_types[d[0]];
            if (type === "impacts salinity") {
              const maxY = line - r * 1.2;
              if ((d.y ?? 0) > maxY) {
                d.y = maxY;
                if (d.vy && d.vy > 0) d.vy = 0;
              }
            } else if (type === "impacted by salinity") {
              const minY = line + r * 1.2;
              if ((d.y ?? 0) < minY) {
                d.y = minY;
                if (d.vy && d.vy < 0) d.vy = 0;
              }
            }
          });
        })
        .on("tick", () => {
          circles
            .attr(
              "cx",
              (d) =>
                (d.x = clip(d.x, [
                  0 + radiusScale(d[1]),
                  this.width - radiusScale(d[1]),
                ])),
            )
            .attr(
              "cy",
              (d) =>
                (d.y = clip(d.y, [
                  0 + radiusScale(d[1]) + 30, // 5 is for the label
                  this.height - radiusScale(d[1]) - 30,
                ])),
            ).classed("is_top", d => d.is_top = d.y < this.height*center)
            .classed("is_bottom", d => d.is_bottom = d.y > this.height*center)
          circles.filter((d) => d[0] === "Salinity")
            .classed("is_top", false)
            .classed("is_bottom", false)
            .attr("cx", (d) => d.x = this.width/2)
            .attr("cy", (d) => d.y = this.height* center)
          node_labels
            .selectAll("tspan")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y);
          const salinityCx = this.width / 2, salinityCy = this.height * center, salinityR = 55;
          links.each(function(d: any) {
              const nx = d.x || salinityCx, ny = d.y || salinityCy;
              const dx = salinityCx - nx, dy = salinityCy - ny;
              const dist = Math.sqrt(dx*dx + dy*dy) || 1;
              const ux = dx / dist, uy = dy / dist;
              const nodeR = d.r || 12;
              const nodeEdgeX = nx + ux * nodeR, nodeEdgeY = ny + uy * nodeR;
              const salEdgeX = salinityCx - ux * (salinityR + 4), salEdgeY = salinityCy - uy * (salinityR + 4);
              const isDriver = node_types[d[0]] === "impacts salinity";
              const x1 = isDriver ? nodeEdgeX : salEdgeX;
              const y1 = isDriver ? nodeEdgeY : salEdgeY;
              const x2 = isDriver ? salEdgeX : nodeEdgeX;
              const y2 = isDriver ? salEdgeY : nodeEdgeY;
              const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
              d3.select(this).attr("d", `M${x1},${y1} L${mx},${my} L${x2},${y2}`);
          })
          .classed("is_top", (d: any) => d.is_top = d.y < this.height*center)
          .classed("is_bottom", (d: any) => d.is_bottom = d.y > this.height*center)
            
        //   this.updateContour(bubble_data)
        })
        .on("end", () => {
          console.log("simulation end", { _nodes_data });
        //   callback(bubble_data)
        })
        // circles.call(
        //   d3
        //     .drag()
        //     .on("start", (e) => dragstarted(e, this.simulation, nodes))
        //     .on("drag", (e) => dragged(e))
        //     .on("end", (e) => dragended(e, this.simulation, nodes))
        // );
    }
    highlightSelectBubble(bubble_data) {
      console.log("highlightSelectBubble", bubble_data)
      const svg = d3.select(`#${this.svgId}`)
      svg.selectAll("circle.bubble").classed("selected", false)
      .filter((d) => bubble_data.id === d.id).classed("selected", true)
    }
}
function dragstarted(event, simulation, nodes) {
  if (!event.active) simulation.alphaTarget(0.2).restart();
  document.querySelector(".tooltip")!.style.display = "none"
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
  nodes.filter(d => d.id === event.subject.id).classed("mousedown", true)
}

// Update the subject (dragged node) position during drag.
function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
  // event.subject.x = event.x;
  // event.subject.y = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event, simulation, nodes) {
  console.log("dragended", event.active)
  if (!event.active) simulation.stop();
  event.subject.fx = null;
  event.subject.fy = null;
  nodes.filter(d => d.id === event.subject.id).classed("mousedown", false)
}

function clip(x, range) {
    return Math.max(Math.min(x, range[1]), range[0]);
  }
  function wrap(text, radius: number) {
    text.each(function (d) {
        const node = d3.select(this);
        const fullText = node.text();
        const words = fullText.split(/[\s-]+/).filter(Boolean);
        const x = d.x;
        const y = d.y;
        const lineHeight = 1.1; // ems
        const padding = 5; // px reserved on each chord
        const fontSizePx = parseFloat(node.attr("font-size") || "12") || 12;
        const lineHeightPx = fontSizePx * lineHeight;

        // Width of the horizontal chord at vertical offset `dyPx` from circle center
        const chordWidth = (dyPx: number) => {
            const r2 = radius * radius - dyPx * dyPx;
            return r2 > 0 ? 2 * Math.sqrt(r2) - padding : 0;
        };

        // Hidden tspan used purely for measurement
        const measureTspan = node.text(null)
            .append("tspan")
            .attr("visibility", "hidden");
        const measure = (s: string) => {
            measureTspan.text(s);
            return measureTspan.node()!.getComputedTextLength();
        };

        // Break a single word into chunks that each fit in `maxWidth`.
        // Always emits at least one char per chunk to guarantee progress.
        const breakWord = (word: string, maxWidth: number): string[] => {
            const chunks: string[] = [];
            let current = "";
            for (const ch of word) {
                const trial = current + ch;
                if (current.length > 0 && measure(trial) > maxWidth) {
                    chunks.push(current);
                    current = ch;
                } else {
                    current = trial;
                }
            }
            if (current) chunks.push(current);
            return chunks.length > 0 ? chunks : [word];
        };

        // Greedy layout assuming `assumedLineCount` total lines (so we know
        // each line's vertical offset and thus its chord width). Returns the
        // resulting lines, or null if the text didn't fit in that many.
        const tryLayout = (assumedLineCount: number): string[] | null => {
            const lines: string[] = [];
            const remaining = [...words];
            for (let i = 0; i < assumedLineCount; i++) {
                const yOffset = (i - (assumedLineCount - 1) / 2) * lineHeightPx;
                const maxWidth = chordWidth(Math.abs(yOffset) + lineHeightPx / 2);
                if (maxWidth <= 0) return null;

                let line = "";
                while (remaining.length > 0) {
                    const next = remaining[0];
                    const trial = line ? line + " " + next : next;
                    if (measure(trial) <= maxWidth) {
                        line = trial;
                        remaining.shift();
                    } else if (!line) {
                        // Single word exceeds chord width — break it character-wise
                        const chunks = breakWord(next, maxWidth);
                        line = chunks[0];
                        const leftover = next.slice(chunks[0].length);
                        if (leftover) remaining[0] = leftover;
                        else remaining.shift();
                        break;
                    } else {
                        break;
                    }
                }
                lines.push(line);
                if (remaining.length === 0) return lines;
            }
            return null;
        };

        const maxLines = Math.max(1, Math.floor((2 * radius) / lineHeightPx));
        let lines: string[] | null = null;
        for (let n = 1; n <= maxLines && !lines; n++) {
            lines = tryLayout(n);
        }
        // Fallback: take whatever fits in maxLines, dropping any leftover
        if (!lines) {
            lines = tryLayout(maxLines) || [fullText];
        }

        measureTspan.remove();
        node.text(null);
        const total = lines.length;
        lines.forEach((line, i) => {
            const dyEm = (i - (total - 1) / 2) * lineHeight;
            node.append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dyEm + "em")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .text(line);
        });
    });
  }