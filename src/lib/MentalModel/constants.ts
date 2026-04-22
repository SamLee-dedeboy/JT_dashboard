
// export const server_address = "http://127.0.0.1:8000/api/mental-model";
import { app_server_address } from "../../app_constants";
export const server_address = `${app_server_address}api/mental-model`;
export const categories = ["Value", "Drivers", "Governance", "Strategies"]

// Map each node_type to a categorical color from app.css. Shared by the
// renderer (circle fill) and the tooltip (border accent) so both stay in sync.
const nodeTypeColor: Record<string, string> = {
  "impacts salinity": "var(--cat-1)",
  "impacted by salinity": "var(--cat-2)",
};
const defaultNodeColor = "var(--cat-3)";
export function colorForNode(nodeType: string | undefined): string {
  return (nodeType && nodeTypeColor[nodeType]) || defaultNodeColor;
}