import * as d3 from "d3"
const sub_categories = ["Drivers", "Strategies", "Value", "Governance"]
export const bubble_color = d3.scaleOrdinal(sub_categories, d3.schemeTableau10);

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
/**
 *
 * @param hex color value in rgb hex
 * @param alpha number between 0 and 1
 * @param r_format "rgbaHex" or "rgbHex"
 * @returns
 */
export function setOpacity(hex, alpha, r_format = "rgbaHex") {
    if (r_format === "rgbaHex") {
      return `${hex}${Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`;
    } else if (r_format === "rgbHex") {
      return rgbaHexToRgbHex(setOpacity(hex, alpha));
    }
  }
  
  /**
   *
   * @param rgbaHex color value in rgba hex
   * @returns color value in rgb hex
   */
  export function rgbaHexToRgbHex(rgbaHex) {
    // Remove the hash at the start if it's there
    rgbaHex = rgbaHex.replace(/^#/, "");
  
    // Parse the hex values
    let r = parseInt(rgbaHex.slice(0, 2), 16);
    let g = parseInt(rgbaHex.slice(2, 4), 16);
    let b = parseInt(rgbaHex.slice(4, 6), 16);
    let a = parseInt(rgbaHex.slice(6, 8), 16) / 255;
  
    // Calculate the RGB values accounting for the alpha (opacity)
    let rOut = Math.round((1 - a) * 255 + a * r);
    let gOut = Math.round((1 - a) * 255 + a * g);
    let bOut = Math.round((1 - a) * 255 + a * b);
  
    // Convert the RGB values back to hex
    function componentToHex(c) {
      let hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }
  
    let rgbHex =
      "#" + componentToHex(rOut) + componentToHex(gOut) + componentToHex(bOut);
    return rgbHex;
  }

