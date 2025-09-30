
import * as d3 from "d3";
export const server_address = "http://127.0.0.1:8000/api/linking";
const sub_categories = ["Drivers", "Strategies", "Value", "Governance"]
export const bubble_color = d3.scaleOrdinal(sub_categories, d3.schemeTableau10);