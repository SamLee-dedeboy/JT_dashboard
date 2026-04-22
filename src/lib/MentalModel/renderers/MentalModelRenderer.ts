import * as d3 from "d3"
import { contrastTextColor } from "../../../constants/colors"
import { colorForNode } from "../constants"
const center = 1.8/3;
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
          .attr("r", 80)
        svg.append("text")
          .attr("class", "bubble_label")
          .classed("jt-body-3", true)
          .attr("x", this.width/2)
          .attr("y", this.height * center)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-family", "'Hammersmith One', sans-serif")
          .attr("font-size", Math.max(8, Math.min(20, 80 * 0.3)))
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
        const radiusScale = d3.scaleSqrt().domain([0, d3.max(nodes_data, d => d[1])]).range([18, 65])
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
                .attr("r", d => d.r = d[0] === "Salinity"? 80: radiusScale(d[1])),
              update => update
                .attr("fill", d => d[0] === "Salinity" ? "var(--brand-primary)" : colorForNode(node_types[d[0]]))
                .transition().duration(100)
                .attr("cx", (d) => d.x = code_tsne[d[0]] * this.width || this.width/2)
                .attr("cy", (d) => d.y = classification_force_position_y[node_types[d[0]]] || this.height*center)
                .attr("r", d => d.r = d[0] === "Salinity"? 80: radiusScale(d[1])),
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
              const r = d[0] === "Salinity" ? 80 : radiusScale(d[1]);
              return Math.max(8, Math.min(20, r * 0.3)) + "px";
            })
            .attr("fill", (d) =>
              d[0] === "Salinity"
                ? contrastTextColor("var(--brand-primary)")
                : contrastTextColor(colorForNode(node_types[d[0]]))
            )
            .attr("pointer-events", "none")
            .text((d) => d[0])
            .each(function(d) {
              wrap(d3.select(this), d.r*2)
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

        const links = svg.select("g.links_group").selectAll("line")
            .data(nodes_data.filter(d => d[0] !== "Salinity"), (d) => d[0])
            .join("line")
            .attr("class", "link")
            .attr("x1", (d) => d.x || this.width/2)
            .attr("y1", (d) => d.y || this.height * center)
            .attr("x2", this.width/2)
            .attr("y2", this.height*center)
            .attr("stroke-width", 1.5)
            // .attr("stroke", "#26414b")
            .attr("stroke", "#c3c3c3")
            .attr("stroke-opacity", 0.5)
        const canvasRadiusScale = d3.scalePow().exponent(1/2).domain([d3.min(nodes_data, d => d[1]), d3.max(nodes_data, d => d[1])]).range([0, this.height * center / 1.5])
        // update force
        const forceNode = d3.forceManyBody();
        this.simulation = d3
        .forceSimulation(nodes)
        // .alphaMin(0.3)
        .alphaMin(0.001)
        // .force("parent_x", d3.forceX((d) => d.parent_x).strength(0.1))  
        // .force("parent_y", d3.forceY((d) => d.parent_y).strength(0.1))
        .force("tsne_x", d3.forceX((d) => code_tsne[d[0]] * this.width || this.width/2).strength(0.1))
        .force("clf_y", d3.forceY((d) => classification_force_position_y[node_types[d[0]]] || this.height * center).strength(0.12))
        // .force("center_x", d3.forceX(this.width/2).strength(0.02))
        // .force("center_y", d3.forceY(this.height*center).strength(0.01))
        .force("frequency_y", d3.forceRadial(null, this.width/2, this.height*center).radius((d) => canvasRadiusScale(d[1]) + 120).strength(1))
        // .force("clf_y", d3.forceY((d) => classification_force_position_y[node_types[d[0]]] || this.height * center).strength(0.08))
        // .force("center", d3.forceCenter(this.width / 2, this.height * center).strength(0.02))
        // .force("charge", forceNode.distanceMin(20))
        .force("collide", d3.forceCollide((d) => 1.2*d.r).strength(0.02))
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
          links.attr("x1", (d) => d.x || this.width/2)
            .attr("y1", (d) => d.y || this.height* center)
            .classed("is_top", d => d.is_top = d.y < this.height*center)
            .classed("is_bottom", d => d.is_bottom = d.y > this.height*center)
            
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
  function wrap(text, width) {
    text.each(function (d, i) {
        let text = d3.select(this)
        let words = text.text().split(/[\s-]+/).reverse(),
            word,
            line: any[] = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = d.x,
            y = d.y,
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em")
                .attr("text-anchor", "bottom")
                .attr("dominant-baseline", "central")
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node()!.getComputedTextLength() > width && line.length > 1) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .attr("dominant-baseline", "central")
                    .text(word);
            }
          }
          const line_num = text.selectAll("tspan").nodes().length
          if(line_num > 1) {
            const offset = lineHeight * (line_num - 1) / 2
            text.selectAll("tspan").attr("dy", function() {
              const dy = parseFloat(d3.select(this).attr("dy"))
              return dy - offset + "em"
            })
            // text.selectAll("tspan").attr("dy", parseFloat(y) - em_to_px / 2 * lineHeight * (line_num - 1) / 2)
          }
    });
  }