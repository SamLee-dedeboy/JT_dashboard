import * as d3 from "d3";
import { bubble_color } from "../constants";
export type tCode = {
    name: string;
    participants: string[];
    scenario_children: string[];
  };

export type GraphNode = d3.SimulationNodeDatum & {
    id: string;
    name: string;
    radius: number;
    participantCount: number;
    depth: number;
    isVisible: boolean;
    isExpanded: boolean;
    children: string[];
    hasChildren: boolean;
    color: string;
};

type GraphLink = d3.SimulationLinkDatum<GraphNode> & {
    source: string | GraphNode;
    target: string | GraphNode;
};

// Returns "#000" or "#fff" depending on which gives better contrast against
// `cssColor` (which may be a hex, rgb(), or var(--cat-1) string). Results are
// cached so the DOM resolution only runs once per distinct input.
const contrastCache = new Map<string, string>();
function contrastTextColor(cssColor: string): string {
    const cached = contrastCache.get(cssColor);
    if (cached) return cached;
    const el = document.createElement("span");
    el.style.color = cssColor;
    el.style.display = "none";
    document.body.appendChild(el);
    const resolved = getComputedStyle(el).color;
    document.body.removeChild(el);
    const match = resolved.match(/\d+(\.\d+)?/g);
    let textColor = "#fff";
    if (match && match.length >= 3) {
        const [r, g, b] = match.slice(0, 3).map(Number);
        const toLinear = (c: number) => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        const L =
            0.2126 * toLinear(r) +
            0.7152 * toLinear(g) +
            0.0722 * toLinear(b);
        textColor = L > 0.5 ? "#000" : "#fff";
    }
    contrastCache.set(cssColor, textColor);
    return textColor;
}

export class CodeGraphRenderer {
    svgId: string;
    width: number = 600
    height: number = 600
    dispatchHover: (node: GraphNode | null) => void = () => {};
    onZoomChange: (scale: number) => void = () => {};
    private allNodes: GraphNode[] = [];
    private allLinks: GraphLink[] = [];
    private zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

    constructor(svgId: string, dispatchHover: (node: GraphNode | null) => void) {
        this.svgId = svgId
        this.dispatchHover = dispatchHover;
    }
    init() {
        console.log("Initializing CodeGraphRenderer");
        const svg = d3.select<SVGSVGElement, unknown>(`#${this.svgId}`)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)

        // Zoomable group: link/node/label layers pan and zoom together.
        const zoomGroup = svg.append("g").attr("class", "zoom-group")
        zoomGroup.append("g").attr("class", "link-group")
        zoomGroup.append("g").attr("class", "node-group")
        zoomGroup.append("g").attr("class", "label-group")

        this.zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                zoomGroup.attr("transform", event.transform.toString());
                this.onZoomChange(event.transform.k);
            });
        svg.call(this.zoomBehavior);
    }

    zoomIn() {
        if (!this.zoomBehavior) return;
        const svg = d3.select<SVGSVGElement, unknown>(`#${this.svgId}`);
        svg.transition().duration(250).call(this.zoomBehavior.scaleBy, 1.4);
    }

    zoomOut() {
        if (!this.zoomBehavior) return;
        const svg = d3.select<SVGSVGElement, unknown>(`#${this.svgId}`);
        svg.transition().duration(250).call(this.zoomBehavior.scaleBy, 1 / 1.4);
    }

    resetZoom() {
        if (!this.zoomBehavior) return;
        const svg = d3.select<SVGSVGElement, unknown>(`#${this.svgId}`);
        svg.transition().duration(350).call(this.zoomBehavior.transform, d3.zoomIdentity);
    }
    
    private calculateNodeDepths(codes: tCode[]): Map<string, number> {
        const depths = new Map<string, number>();
        const visited = new Set<string>();
        
        // Create a map of parent -> children relationships
        const parentToChildren = new Map<string, string[]>();
        codes.forEach(code => {
            parentToChildren.set(code.name, code.scenario_children);
        });
        
        // Create a map of child -> parents relationships
        const childToParents = new Map<string, string>();
        codes.forEach(code => {
            if(code.name === "root") return;
            if(!code.name.includes("\\")) {
                childToParents.set(code.name, "root");
                return
            }
            const parent = code.name.split("\\").at(-1);
            childToParents.set(code.name, parent!);
        });
        console.log("Children to parent Map:", childToParents);
        
        // Find root nodes (nodes with no parents)
        const rootNodes = codes.filter(code => !childToParents.has(code.name));
        
        // Perform BFS to calculate depths
        const queue: { name: string; depth: number }[] = rootNodes.map(node => ({ name: node.name, depth: 0 }));
        
        while (queue.length > 0) {
            const { name, depth } = queue.shift()!;
            
            if (visited.has(name)) continue;
            visited.add(name);
            depths.set(name, depth);
            
            const children = parentToChildren.get(name) || [];
            children.forEach(child => {
                if (!visited.has(child)) {
                    queue.push({ name: child, depth: depth + 1 });
                }
            });
        }
        
        return depths;
    }
    update(codes: tCode[]) {
        console.log("Updating CodeGraphRenderer with codes:", codes);
        const svg = d3.select(`#${this.svgId}`)
        
        // Calculate node depths
        const nodeDepths = this.calculateNodeDepths(codes);
        console.log("Node Depths:", nodeDepths);

        const scaleRadius = d3.scalePow().exponent(1/2).domain([0, d3.max(codes, d=>d.participants.length) || 1]).range([12, 40])
        // Construct graph data structure
        const nodes: GraphNode[] = codes.filter(code => code.name !== "root").map(code => ({
            id: code.name,
            name: code.name.split("\\").at(-1)!,
            radius: scaleRadius(code.participants.length),
            participantCount: code.participants.length,
            depth: nodeDepths.get(code.name) || 0,
            isVisible: true, // All nodes visible by default
            isExpanded: true,
            children: code.scenario_children,
            hasChildren: code.scenario_children.length > 0,
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            color: bubble_color(code.name.split("\\")[0])
        }));
        
        // Store all nodes and links for later reference
        this.allNodes = nodes;
        
        // Create links from scenario_children relationships
        const links: GraphLink[] = [];
        codes.forEach(code => {
            code.scenario_children.forEach(childName => {
                // Check if child exists in our codes array
                if (codes.some(c => c.name === childName)) {
                    links.push({
                        source: code.name,
                        target: childName
                    });
                }
            });
        });
        this.allLinks = links;
        
        // Render only visible nodes and their connections
        this.renderVisibleGraph();
    }
    
    private renderVisibleGraph() {
        const svg = d3.select(`#${this.svgId}`);
        
        // Clear previous content
        // svg.select(".node-group").selectAll("*").remove()
        // svg.select(".link-group").selectAll("*").remove()
        
        // Filter visible nodes and links
        const visibleNodes = this.allNodes.filter(node => node.isVisible);
        const visibleLinks = this.allLinks.filter(link => {
            const sourceNode = this.allNodes.find(n => n.id === (typeof link.source === 'string' ? link.source : link.source.id));
            const targetNode = this.allNodes.find(n => n.id === (typeof link.target === 'string' ? link.target : link.target.id));
            return sourceNode?.isVisible && targetNode?.isVisible;
        });
        
        console.log("Visible Nodes:", visibleNodes);
        console.log("Visible Links:", visibleLinks);

        const scaleRadialRadius = d3.scalePow()
            .exponent(2)
            .domain([1, d3.max(this.allNodes, d => d.depth) || 1])
            .range([0, Math.max(this.width, this.height) * 1.2])
        // Anchors placed well outside the viewBox so the four category branches
        // splay clearly in four directions rather than clustering at center.
        const cornerForce = {
            "Drivers": [-this.width / 2, -this.height / 2],
            "Strategies": [this.width * 1.5, -this.height / 2],
            "Value": [-this.width / 2, this.height * 1.5],
            "Governance": [this.width * 1.5, this.height * 1.5],
        }

        // Build sibling groups: visible nodes that share a parent and depth.
        // Used by the "sibling-repel" custom force below to push same-parent
        // same-level nodes apart without affecting unrelated nodes.
        const visibleById = new Map<string, GraphNode>(
            visibleNodes.map((n) => [n.id, n])
        );
        const siblingGroups: GraphNode[][] = [];
        const childrenByParent = new Map<string, GraphNode[]>();
        visibleLinks.forEach((l) => {
            const srcId = typeof l.source === "string" ? l.source : l.source.id;
            const tgtId = typeof l.target === "string" ? l.target : l.target.id;
            const child = visibleById.get(tgtId);
            if (!child) return;
            if (!childrenByParent.has(srcId)) childrenByParent.set(srcId, []);
            childrenByParent.get(srcId)!.push(child);
        });
        childrenByParent.forEach((group) => {
            if (group.length > 1) siblingGroups.push(group);
        });

        // Custom force: pairwise repulsion between siblings (same parent, and
        // therefore same depth). Scoped to each sibling group so nodes from
        // different branches don't push each other.
        const siblingRepelStrength = 400;
        const siblingRepel = (alpha: number) => {
            for (const group of siblingGroups) {
                for (let i = 0; i < group.length; i++) {
                    const a = group[i];
                    for (let j = i + 1; j < group.length; j++) {
                        const b = group[j];
                        let dx = (b.x ?? 0) - (a.x ?? 0);
                        let dy = (b.y ?? 0) - (a.y ?? 0);
                        let d2 = dx * dx + dy * dy;
                        if (d2 === 0) {
                            dx = Math.random() - 0.5;
                            dy = Math.random() - 0.5;
                            d2 = dx * dx + dy * dy || 1;
                        }
                        const k = (siblingRepelStrength * alpha) / d2;
                        a.vx = (a.vx ?? 0) - dx * k;
                        a.vy = (a.vy ?? 0) - dy * k;
                        b.vx = (b.vx ?? 0) + dx * k;
                        b.vy = (b.vy ?? 0) + dy * k;
                    }
                }
            }
        };

        // Set up D3 force simulation with visible nodes
        const simulation = d3.forceSimulation(visibleNodes)
            .force("link", d3.forceLink<GraphNode, GraphLink>(visibleLinks)
                .id(d => d.id)
                .distance(d => {
                    // Scale distance by the radius of connected nodes
                    const sourceNode = typeof d.source === 'object' ? d.source : visibleNodes.find(n => n.id === d.source);
                    const targetNode = typeof d.target === 'object' ? d.target : visibleNodes.find(n => n.id === d.target);

                    // Depth-1 → depth-2 edges use a tighter range so second-level
                    // clusters hug their category root.
                    const isTopToSecond =
                        sourceNode && targetNode &&
                        ((sourceNode.depth === 1 && targetNode.depth === 2) ||
                         (sourceNode.depth === 2 && targetNode.depth === 1));
                    const baseDistance = isTopToSecond ? 20 : 100;
                    const minDistance = isTopToSecond ? 60 : 140;
                    const maxDistance = isTopToSecond ? 100 : 500;

                    if (sourceNode && targetNode) {
                        // Distance is base distance plus sum of radii with a multiplier
                        const calculatedDistance = baseDistance + (sourceNode.radius + targetNode.radius) * 1.5;
                        // Clamp the distance between min and max values
                        return Math.max(minDistance, Math.min(maxDistance, calculatedDistance));
                    }
                    return Math.max(minDistance, baseDistance);
                })
                .strength(1))
            .force("charge", d3.forceManyBody().strength(-1))
            // .force("radial", d3.forceRadial(null, this.width / 2, this.height / 2).radius(d => {
            //     return scaleRadialRadius(d.depth)
            // }).strength(0.5))
            // Depth-1 nodes are pulled strongly toward the viewport center so
            // they form a tight cluster there; deeper nodes are pulled toward
            // their category's corner anchor so branches splay outward.
            .force("x", d3.forceX<GraphNode>().x(d => {
                if (d.depth <= 1) return this.width / 2;
                const corner = cornerForce[d.id.split("\\")[0]];
                return corner ? corner[0] : this.width / 2;
            }).strength(d => d.depth <= 1 ? 2 : 0.03))
            .force("y", d3.forceY<GraphNode>().y(d => {
                if (d.depth <= 1) return this.height / 1.5;
                const corner = cornerForce[d.id.split("\\")[0]];
                return corner ? corner[1] : this.height / 2;
            }).strength(d => d.depth <= 1 ? 2 : 0.05))
            // .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collision", d3.forceCollide<GraphNode>()
                .radius(d => d.radius + 5)
                .strength(1))
            // .force("sibling-repel", siblingRepel);
            // svg.append("circle")
            //     .attr("cx", this.width / 2)
            //     .attr("cy", this.height / 2)
            //     .attr("r", scaleRadialRadius(1) + 20)
            //     .attr("fill", "none")
            //     .attr("stroke", "#ccc")
            //     .attr("stroke-width", 1)
            //     .lower(); // Send to back
        
        // Render links
        const link = svg.select(".link-group")
            .selectAll("line")
            .data(visibleLinks)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 2);
        
        // Render nodes
        const node = svg.select(".node-group")
            .selectAll("circle")
            .data(visibleNodes, d => d.id)
            .join(enter => enter.append("circle")
                .attr("cx", d => d.x = d.x!)
                .attr("cy", d => d.y = d.y!)
                .attr("r", d => d.radius)
                .attr("fill", d => d.color)
                .attr("stroke", "#333")
                .attr("stroke-width", 1.5)
                .style("cursor", "pointer")
                .on("mouseover", (_event, d) => this.dispatchHover(d))
                .on("mouseleave", () => this.dispatchHover(null)),
                update => update
                    .attr("cx", d => d.x = d.x!)
                    .attr("cy", d => d.y = d.y!)
            )
        
        // Add labels. Font-size is scaled from the node radius so the text
        // always reads at a similar weight relative to its bubble; `wrap` then
        // breaks it over multiple lines using the node's diameter as the line
        // width, and a final shrink pass catches anything that still overflows
        // (e.g. a single long word that wrap can't split).
        const label = svg.select(".label-group")
            .selectAll("text")
            .data(visibleNodes)
            .join("text")
            .text(d => d.name)
            .attr("font-size", d => Math.max(6, Math.min(14, d.radius * 0.35)) + "px")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .style("pointer-events", "none")
            .style("fill", d => contrastTextColor(d.color))
            .call(wrap);
        
        // Add drag behavior
        const drag = d3.drag<SVGCircleElement, GraphNode>()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
        
        (node as any).call(drag);
        
        // Update positions on simulation tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as GraphNode).x!)
                .attr("y1", d => (d.source as GraphNode).y!)
                .attr("x2", d => (d.target as GraphNode).x!)
                .attr("y2", d => (d.target as GraphNode).y!);
            
            node
                .attr("cx", d => d.x=d.x!)
                .attr("cy", d => d.y=d.y!);
            
            label.selectAll("tspan")
                .attr("x", d => d.x=d.x!)
                .attr("y", d => d.y=d.y!);
        });
    }
    
}
  function wrap(text) {
    text.each(function (d, i) {
        const textSel = d3.select(this)
        // Available width inside the circle, with small padding.
        const width = d.radius * 2 * 0.85;
        const lineHeight = 1.1; // ems
        let words = textSel.text().split(/[\s-]+/).reverse(),
            word,
            line: any[] = [],
            lineNumber = 0,
            x = d.x,
            y = d.y,
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = textSel.text(null)
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
                tspan = textSel.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .attr("dominant-baseline", "central")
                    .text(word);
            }
          }
          const line_num = textSel.selectAll("tspan").nodes().length
          if(line_num > 1) {
            const offset = lineHeight * (line_num - 1) / 2
            textSel.selectAll("tspan").attr("dy", function() {
              const dy = parseFloat(d3.select(this).attr("dy"))
              return dy - offset + "em"
            })
          }
          // Post-fit: if any single line (e.g. an unsplittable long word) or
          // the total stack height still overflows the circle, shrink the
          // font-size uniformly to make it fit.
          const currentSize = parseFloat(textSel.attr("font-size")) || 10;
          let maxLen = 0;
          textSel.selectAll("tspan").each(function () {
            maxLen = Math.max(maxLen, (this as SVGTextContentElement).getComputedTextLength());
          });
          const availableHeight = d.radius * 2 * 0.85;
          const stackHeight = line_num * currentSize * lineHeight;
          const widthRatio = maxLen > width ? width / maxLen : 1;
          const heightRatio = stackHeight > availableHeight ? availableHeight / stackHeight : 1;
          const shrink = Math.min(widthRatio, heightRatio);
          if (shrink < 1) {
            textSel.attr("font-size", (currentSize * shrink) + "px");
          }
    });
  }