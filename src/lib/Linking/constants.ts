
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

// Returns "#000" or "#fff" depending on which gives better WCAG contrast
// against `cssColor` (hex, rgb(), or var(--…)). Results are cached so each
// distinct input hits `getComputedStyle` only once.
const contrastCache = new Map<string, string>();
export function contrastTextColor(cssColor: string): string {
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
      0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    textColor = L > 0.5 ? "#000" : "#fff";
  }
  contrastCache.set(cssColor, textColor);
  return textColor;
}