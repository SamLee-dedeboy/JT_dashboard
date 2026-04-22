
import * as d3 from "d3";
import { app_server_address } from "../../app_constants";
export const server_address = `${app_server_address}api/linking`;
const sub_categories = ["Drivers", "Strategies", "Value", "Governance"];
// Categorical colors defined in app.css (--cat-1 ... --cat-4).
// Using CSS var() strings so SVG fills pick up theme values directly.
const category_palette = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
];
export const bubble_color = d3.scaleOrdinal(sub_categories, category_palette);
export { contrastTextColor } from "../../constants/colors";