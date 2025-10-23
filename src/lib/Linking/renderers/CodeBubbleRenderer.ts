import * as d3 from "d3"
import concaveman from "concaveman";
import {
  BSplineShapeGenerator,
  BubbleSet,
  PointPath,
  ShapeSimplifier,
} from 'bubblesets';
import { bubble_color } from "../constants";

// Type definitions for bubble data
type tCode = {
    name: string;
    participants: string[];
    scenario_children: string[];
};

type tBubble = {
    id: string;
    data: tCode;
    x: number;
    y: number;
    r?: number;
    parent_x?: number;
    parent_y?: number;
    fx?: number | null;
    fy?: number | null;
};

/**
 * CodeBubbleRenderer handles the rendering and interaction of code bubbles.
 * 
 * Features:
 * - Click a bubble to move it to the top-left corner and fix its position
 * - The clicked bubble's position remains fixed during simulation
 * - Use clearClickedBubble() to unfix the bubble and allow normal movement
 * - Use getClickedBubble() to get the currently fixed bubble
 */
export class CodeBubbleRenderer {
    svgId: string;
    width: number = 600
    height: number = 600
    handleClick: Function
    simulation: any
    clickedBubble: tBubble | null = null  // Track the clicked bubble
    constructor(svgId: string, handleClick: Function) {
        this.svgId = svgId
        this.handleClick = handleClick
    }

    init() {
        const svg = d3.select(`#${this.svgId}`)
        const bubble_group = svg.append("g").attr("class", "bubble_group")
        const labels_group = svg.append("g").attr("class", "labels_group")
        const contour_path_group = svg.append("g").attr("class", "contour-path-group")
        // this.width = +svg.node().getBoundingClientRect().width
        // this.height = +svg.node().getBoundingClientRect().height
        svg.attr("viewBox", `0 0 ${this.width} ${this.height}`)
    }

    update(bubble_data: tBubble[], callback=(d: tBubble[])=>{}) {
        console.log("bubble_data", JSON.parse(JSON.stringify(bubble_data)));
        
        // Handle clicked bubble when data is updated
        if (this.clickedBubble) {
            // Find the corresponding bubble in the new data
            const clickedBubbleInNewData = bubble_data.find(d => d.id === this.clickedBubble!.id);
            if (clickedBubbleInNewData) {
                // Update the reference and maintain fixed position
                this.clickedBubble = clickedBubbleInNewData;
                const radius = 10; // We'll update this with the proper radius scale later
                clickedBubbleInNewData.fx = radius + 20;
                clickedBubbleInNewData.fy = radius + 20;
                clickedBubbleInNewData.x = radius + 20;
                clickedBubbleInNewData.y = radius + 20;
            } else {
                // The clicked bubble is no longer in the data, clear it
                this.clickedBubble = null;
            }
        }
        
        const svg = d3.select(`#${this.svgId}`)
        const bubble_group = svg.select("g.bubble_group")
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(bubble_data, (d: tBubble) => d.data.participants.length) || 0])
            .range([25, this.width/5])
        const fontScale = d3.scaleSqrt()
            .domain([0, d3.max(bubble_data, (d: tBubble) => d.data.participants.length) || 0])
            .range([15, 25])
        
        // Update clicked bubble position with correct radius
        if (this.clickedBubble) {
            const radius = radiusScale(this.clickedBubble.data.participants.length);
            this.clickedBubble.fx = radius + 20;
            this.clickedBubble.fy = radius + 20;
            this.clickedBubble.x = radius + 20;
            this.clickedBubble.y = radius + 20;
        }
        
        const sub_categories = ["Drivers", "Strategies", "Value", "Governance"]
        const nodes = bubble_group.selectAll<SVGCircleElement, tBubble>("circle")
            .data(bubble_data, (d: tBubble) => d.id)
            .join(
              enter => enter.append("circle")
                .attr("class", "bubble")
                .attr("fill", (d: tBubble) => bubble_color(d.data.name.split("\\").at(0) || ""))
                .attr("fill-opacity", 0.8)
                .attr("cursor", "pointer")
                .on("mouseover", function() {
                    d3.select(this).classed("hovered", true)
                })
                .on("mouseout", function() {
                    d3.select(this).classed("hovered", false)
                })
                .on("click", (e: MouseEvent, d: tBubble) => {
                    // Record the clicked bubble
                    // this.clearClickedBubble();
                    this.clickedBubble = d;
                    
                    // Move bubble to top left corner
                    // const radius = radiusScale(d.data.participants.length);
                    // const targetX = radius + 20; // Add some padding from the edge
                    // const targetY = radius + 20; // Add some padding from the edge
                    
                    // // Set fixed position for simulation
                    // d.fx = targetX;
                    // d.fy = targetY;
                    // d.x = targetX;
                    // d.y = targetY;
                    
                    // // Update the visual position immediately
                    // const targetElement = e.target as SVGCircleElement;
                    // if (targetElement) {
                    //     d3.select(targetElement)
                    //         .transition()
                    //         .duration(300)
                    //         .attr("cx", d.x)
                    //         .attr("cy", d.y);
                    // }
                    
                    // // Update label position
                    // svg.select("g.labels_group")
                    //     .selectAll<SVGTextElement, tBubble>("text")
                    //     .filter((labelData: tBubble) => labelData.id === d.id)
                    //     .selectAll("tspan")
                    //     .transition()
                    //     .duration(300)
                    //     .attr("x", d.x)
                    //     .attr("y", d.y);
                    
                    // Restart simulation to handle collision detection
                    // if (this.simulation) {
                    //     this.simulation.alpha(0.3).restart();
                    // }
                    
                    this.handleClick(d)
                })
                .attr("cx", (d: tBubble) => d.x || this.width/2)
                .attr("cy", (d: tBubble) => d.y || this.height/2)
                .attr("r", 0)
                .call(selection => selection.transition().duration(300).delay(300)
                    .attr("r", (d: tBubble) => {
                        d.r = radiusScale(d.data.participants.length);
                        return d.r;
                    })
                ),
              update => update.transition().duration(100)
                .attr("cx", (d: tBubble) => d.x || this.width/2)
                .attr("cy", (d: tBubble) => d.y || this.height/2),
              exit => exit.transition().duration(300).attr("r", 0).remove()
            )
        const node_labels = svg.select("g.labels_group").selectAll<SVGTextElement, tBubble>("text")
            .data(bubble_data, (d: tBubble) => d.id)
            .join("text")
            .attr("class", "bubble_label")
            .attr("x", (d: tBubble) => d.x)
            .attr("y", (d: tBubble) => d.y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", (d: tBubble) => fontScale(d.data.participants.length))
            .attr("fill", "black")
            .attr("pointer-events", "none")
            .each(function(d: tBubble) {
              const text = d3.select(this);
              text.selectAll("*").remove();
              text.append("tspan")
                .text(d.data.name.split("\\").at(-1) || "")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", d.x)
                .attr("y", d.y)
                .attr("dy", "-0.6em")
                .attr("font-family", "Proxima Nova")
              text.append("tspan")
                .text(`(${d.data.participants.length})`)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", d.x)
                .attr("y", d.y)
                .attr("dy", "0.6em")
            })
        
        // update force
        const forceNode = d3.forceManyBody();
        this.simulation = d3
        .forceSimulation(bubble_data as d3.SimulationNodeDatum[])
        .alphaMin(0.1)
        // .force("parent_x", d3.forceX((d: any) => d.parent_x).strength(0.1))  
        // .force("parent_y", d3.forceY((d: any) => d.parent_y).strength(0.1))
        // .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(0.05))
        // .force("charge", forceNode.distanceMin(20))
        .force("collide", d3.forceCollide((d: any) => 1.1*radiusScale(d.data.participants.length)))
        .on("tick", () => {
          nodes
            .attr(
              "cx",
              (d: tBubble) =>
                (d.x = clip(d.x, [
                  0 + radiusScale(d.data.participants.length),
                  this.width - radiusScale(d.data.participants.length),
                ])),
            )
            .attr(
              "cy",
              (d: tBubble) =>
                (d.y = clip(d.y, [
                  0 + radiusScale(d.data.participants.length) + 5, // 5 is for the label
                  this.height - radiusScale(d.data.participants.length) - 5,
                ])),
            );
          node_labels
            .selectAll("tspan")
            .attr("x", (d: any) => (d as tBubble).x)
            .attr("y", (d: any) => (d as tBubble).y);
          this.updateContour(bubble_data)
        })
        .on("end", () => {
          console.log("simulation end", { bubble_data });
          callback(bubble_data)
        })
        // nodes.call(
        //   d3
        //     .drag()
        //     .on("start", (e) => dragstarted(e, this.simulation, nodes))
        //     .on("drag", (e) => dragged(e))
        //     .on("end", (e) => dragended(e, this.simulation, nodes))
        // );
    }
    
    // Method to clear the clicked bubble and unfix its position
    clearClickedBubble() {
      console.log("clearClickedBubble", this.clickedBubble)
        if (this.clickedBubble) {
            // Unfix the position to allow normal simulation behavior
            this.clickedBubble.fx = null;
            this.clickedBubble.fy = null;
            this.clickedBubble = null;
        }
        
        // Reset all bubble positions to center of canvas
        const svg = d3.select(`#${this.svgId}`)
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Get all bubble data and reset their positions
        const bubbleSelection = svg.select("g.bubble_group").selectAll("circle");
        bubbleSelection.each(function(d: any) {
            const bubbleData = d as tBubble;
            // Reset fixed positions
            bubbleData.fx = null;
            bubbleData.fy = null;
            // Set positions to center
            bubbleData.x = centerX;
            bubbleData.y = centerY;
        });
        
        // Update visual positions immediately
        bubbleSelection
            .attr("cx", centerX)
            .attr("cy", centerY);
            
        // Update label positions
        svg.select("g.labels_group").selectAll("text")
            .attr("x", centerX)
            .attr("y", centerY)
            .selectAll("tspan")
            .attr("x", centerX)
            .attr("y", centerY);
        
        // Restart simulation to update positions
        if (this.simulation) {
            this.simulation.alpha(0.3).restart();
        }
    }
    
    // Method to get the currently clicked bubble
    getClickedBubble(): tBubble | null {
        return this.clickedBubble;
    }
    
    highlightSelectBubble(bubble_data: tBubble) {
      console.log("highlightSelectBubble", bubble_data)
      const svg = d3.select(`#${this.svgId}`)
      svg.selectAll("circle.bubble").classed("selected", false)
      .filter((d: any) => bubble_data.id === (d as tBubble).id).classed("selected", true)
    }
 updateContour(bubble_data: tBubble[]) {
  const pad = 0;
  // bubbles can be reused for subsequent runs or different sets of rectangles
  const bubbles = new BubbleSet();
  // rectangles needs to be a list of objects of the form { x: 0, y: 0, width: 0, height: 0 }
  // lines needs to be a list of objects of the form { x1: 0, x2: 0, y1: 0, y2: 0 }
  // lines can be null to infer lines between rectangles automatically
  const rects = bubble_data.reduce((group, d) => {
    const parent = d.id.split("\\").at(0)
    if(!group[parent]) {
      group[parent] = []
    }
    const offset = 1.2
    const diagonal_offset = 1.2*Math.sqrt(2) / 2
    group[parent] = group[parent].concat([
      [d.x - d.r * diagonal_offset, d.y - d.r * diagonal_offset],
      [d.x - d.r * diagonal_offset, d.y + d.r * diagonal_offset],
      [d.x + d.r * diagonal_offset, d.y + d.r * diagonal_offset],
      [d.x + d.r * diagonal_offset, d.y - d.r * diagonal_offset],
      [d.x, d.y - d.r * offset],
      [d.x - d.r * offset, d.y],
      [d.x, d.y + d.r * offset],
      [d.x + d.r * offset, d.y],
    ])
   
    return group
  }, {})
  // console.log("bubble_data", rects)
  const contour_paths = Object.keys(rects).map((key) => {
    // if(key !== "Drivers") return {id: key, path: ""}
    // const bubbles = new BubbleSet();
    // const rect = BubbleSet.addPadding(rects[key], pad);
    // const list = bubbles.createOutline(
    //   rect,
    //   [],
    //   null /* lines */
    // );
    // const outline = new PointPath(list).transform([
    //   new circleShapeGenerator(),  // smoothes the output shape using b-splines
    // ]);
    // console.log("outline", list)
    const polygons = concaveman(rects[key], 0.5, 100);

    d3.select(`#${this.svgId}`)
    .selectAll(".test-circle")
    .data(rects[key])
    .join("circle")
    .attr("class", "test-circle")
    .attr("cx", (d) => d[0])
    .attr("cy", (d) => d[1])
    .attr("r", 0)
    .attr("fill", "red")
    .attr("opacity", 0.5)
    const path_generator = d3.line()
    .x((p) => p[0])
    .y((p) => p[1])
    // .curve(d3.curveLinear);
    // .curve(d3.curveBasis);
    .curve(d3.curveCatmullRom);
    const outline = path_generator(polygons).toString();
    return {
      id: key,
      path: outline,
    }
  })
  d3.select(`#${this.svgId}`).select(".contour-path-group")
    .selectAll(".contour-path")
    .data(contour_paths)
    .join("path")
    .attr("class", "contour-path")
    .attr('d', (d) => d.path)
    .attr("fill", d => bubble_color(d.id.split("\\").at(0)))
    .attr("opacity", 0.2)
    .attr("pointer-events", "none")
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
