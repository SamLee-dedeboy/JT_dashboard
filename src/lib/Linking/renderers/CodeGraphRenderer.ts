import * as d3 from "d3";
import { bubble_color } from "../constants";
export type tCode = {
    name: string;
    participants: string[];
    scenario_children: string[];
  };

type GraphNode = d3.SimulationNodeDatum & {
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

interface MenuItemData {
    text: string;
    action: () => void;
}

export class CodeGraphRenderer {
    svgId: string;
    width: number = 600
    height: number = 600
    dispatchClick: (node: tCode) => void = () => {};
    private allNodes: GraphNode[] = [];
    private allLinks: GraphLink[] = [];
    private expandedNodes: Set<string> = new Set();
    private contextMenu: any = null;
    private currentNode: GraphNode | null = null;

    constructor(svgId: string, dispatchClick: (node: tCode) => void) {
        this.svgId = svgId
        this.dispatchClick = dispatchClick;
    }
    init() {
        console.log("Initializing CodeGraphRenderer");
        const svg = d3.select(`#${this.svgId}`)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .on("click", () => this.hideContextMenu()); // Hide menu when clicking elsewhere
        svg.append("g").attr("class", "link-group")
        svg.append("g").attr("class", "node-group")
        svg.append("g").attr("class", "label-group")
        svg.append("g").attr("class", "context-menu-group")
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
            isVisible: nodeDepths.get(code.name) === 1, // Initially only show top-level nodes
            isExpanded: false,
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
            .exponent(1/2)
            .domain([1, d3.max(this.allNodes, d => d.depth) || 1])
            .range([0, Math.max(this.width / 2, this.height / 2)])
        const cornerForce = {
            "Drivers": [0, 0],
            "Strategies": [this.width, 0],
            "Value": [0, this.height],
            "Governance": [this.width, this.height],
        }

        // Set up D3 force simulation with visible nodes
        const simulation = d3.forceSimulation(visibleNodes)
            .force("link", d3.forceLink<GraphNode, GraphLink>(visibleLinks)
                .id(d => d.id)
                .distance(d => {
                    // Scale distance by the radius of connected nodes
                    const sourceNode = typeof d.source === 'object' ? d.source : visibleNodes.find(n => n.id === d.source);
                    const targetNode = typeof d.target === 'object' ? d.target : visibleNodes.find(n => n.id === d.target);
                    const baseDistance = 50;
                    const minDistance = 80;  // Minimum distance between any linked nodes
                    const maxDistance = 300; // Maximum distance between any linked nodes
                    
                    if (sourceNode && targetNode) {
                        // Distance is base distance plus sum of radii with a multiplier
                        const calculatedDistance = baseDistance + (sourceNode.radius + targetNode.radius) * 1.5;
                        // Clamp the distance between min and max values
                        return Math.max(minDistance, Math.min(maxDistance, calculatedDistance));
                    }
                    return Math.max(minDistance, baseDistance);
                })
                .strength(0.1))
            .force("charge", d3.forceManyBody()
                .strength(-300)
                .distanceMax(200))
            .force("radial", d3.forceRadial(null, this.width / 2, this.height / 2).radius(d => {
                return scaleRadialRadius(d.depth)
            }).strength(0.5))
            .force("x", d3.forceX().x(d => {
                const corner = cornerForce[d.id.split("\\")[0]];
                return corner ? corner[0] : this.width / 2;
            }).strength(0.1))
            .force("y", d3.forceY().y(d => {
                const corner = cornerForce[d.id.split("\\")[0]];
                return corner ? corner[1] : this.height / 2;
            }).strength(0.1))
            // .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collision", d3.forceCollide<GraphNode>()
                .radius(d => d.radius + 2)
                .strength(0.8));
        
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
                .attr("fill", d => {
                    // Scale saturation based on depth: deeper nodes have less saturation
                    const maxDepth = d3.max(this.allNodes, n => n.depth) || 1;
                    const saturationScale = 1 - (d.depth / (maxDepth + 1)) * 0.95; // Reduce saturation by up to 70%
                    const color = d3.color(d.color);
                    if (color) {
                        const hslColor = d3.hsl(color);
                        hslColor.s *= saturationScale;
                        return hslColor.toString();
                    }
                    return d.color;
                })
                .attr("stroke", d => d.isExpanded && d.hasChildren ? "white" : "#333")
                .attr("stroke-width", d => d.isExpanded && d.hasChildren ? 3 : 1.5)
                .style("cursor", "pointer")
                .on("click", (event, d) => {
                    event.stopPropagation();
                    this.showContextMenu(event, d);
                }),
                update => update
                    .attr("cx", d => d.x = d.x!)
                    .attr("cy", d => d.y = d.y!)
                    .attr("stroke", d => d.isExpanded && d.hasChildren ? "#7ED957" : "#333")
                    .attr("stroke-width", d => d.isExpanded && d.hasChildren ? 3 : 1.5)

            )
        
        // Add labels
        const label = svg.select(".label-group")
            .selectAll("text")
            .data(visibleNodes)
            .join("text")
            .text(d => d.name)
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .style("pointer-events", "none")
            .style("fill", "white")
            .call(wrap, 80);
        
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
            // Apply boundary constraints to visible nodes
            visibleNodes.forEach(d => {
                // Constrain x position within viewBox bounds, accounting for node radius
                d.x = Math.max(d.radius, Math.min(this.width - d.radius, d.x!));
                // Constrain y position within viewBox bounds, accounting for node radius
                d.y = Math.max(d.radius, Math.min(this.height - d.radius, d.y!));
            });
            
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
    
    private handleNodeClick(clickedNode: any) {
        if (!clickedNode.hasChildren) return;
        
        clickedNode.isExpanded = !clickedNode.isExpanded;
        
        // Update visibility of children
        clickedNode.children.forEach(childId => {
            const childNode = this.allNodes.find(n => n.id === childId);
            if (childNode) {
                childNode.isVisible = clickedNode.isExpanded;
                // If collapsing, also collapse and hide all descendants
                if (!clickedNode.isExpanded) {
                    this.hideDescendants(childNode);
                }
            }
        });
        
        // Re-render the graph
        this.renderVisibleGraph();
    }

    private showContextMenu(event: MouseEvent, node: GraphNode) {
        this.hideContextMenu(); // Hide any existing menu
        this.currentNode = node;
        
        const svg = d3.select(`#${this.svgId}`);
        const menuGroup = svg.select(".context-menu-group");
        
        // Get mouse position relative to SVG
        const [x, y] = d3.pointer(event, svg.node());
        
        // Create menu items based on available actions
        const menuItems: MenuItemData[] = [];
        if (node.hasChildren) {
            menuItems.push({
                text: node.isExpanded ? "Collapse" : "Expand",
                action: () => this.handleExpandNode(node)
            });
        }
        menuItems.push({
            text: "View Details",
            action: () => this.handleViewDetails(node)
        });
        
        // Create context menu
        this.contextMenu = menuGroup.append("g")
            .attr("class", "context-menu")
            .attr("transform", `translate(${x}, ${y})`);
        
        const menuWidth = 120;
        const menuHeight = menuItems.length * 30;
        
        // Background rectangle
        this.contextMenu!.append("rect")
            .attr("width", menuWidth)
            .attr("height", menuHeight)
            .attr("fill", "white")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1)
            .attr("rx", 4)
            .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))");
        
        // Menu items
        const menuItemGroups = this.contextMenu!.selectAll(".menu-item")
            .data(menuItems)
            .enter()
            .append("g")
            .attr("class", "menu-item")
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                event.stopPropagation();
                d.action();
                this.hideContextMenu();
            })
            .on("mouseover", function() {
                d3.select(this).select("rect").attr("fill", "#f0f0f0");
            })
            .on("mouseout", function() {
                d3.select(this).select("rect").attr("fill", "transparent");
            });
        
        // Menu item backgrounds
        menuItemGroups.append("rect")
            .attr("width", menuWidth)
            .attr("height", 30)
            .attr("y", (d, i) => i * 30)
            .attr("fill", "transparent");
        
        // Menu item text
        menuItemGroups.append("text")
            .attr("x", 10)
            .attr("y", (d, i) => i * 30 + 20)
            .attr("font-size", "12px")
            .attr("fill", "#333")
            .text(d => d.text);
    }
    
    private hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
    }
    
    private handleExpandNode(node: GraphNode) {
        node.isExpanded = !node.isExpanded;
        
        // Update visibility of children
        node.children.forEach(childId => {
            const childNode = this.allNodes.find(n => n.id === childId);
            if (childNode) {
                childNode.isVisible = node.isExpanded;
                // If collapsing, also collapse and hide all descendants
                if (!node.isExpanded) {
                    this.hideDescendants(childNode);
                }
            }
        });
        
        // Re-render the graph
        this.renderVisibleGraph();
    }
    
    private handleViewDetails(node: any) {
        // Convert GraphNode to tCode format for the callback
        // const tCodeNode: tCode = {
        //     name: node.name,
        //     participants: [], // This would need to be populated with actual data
        //     scenario_children: node.children
        // };
        this.dispatchClick(node);
    }

    private hideDescendants(node: GraphNode) {
        node.isVisible = false;
        node.isExpanded = false;
        node.children.forEach(childId => {
            const childNode = this.allNodes.find(n => n.id === childId);
            if (childNode) {
                this.hideDescendants(childNode);
            }
        });
    }
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