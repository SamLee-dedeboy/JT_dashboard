
import * as d3 from "d3";
import { app_server_address } from "../../app_constants";
export const server_address = `${app_server_address}api/linking`;
const sub_categories = ["Drivers", "Strategies", "Value", "Governance"]
export const bubble_color = d3.scaleOrdinal(sub_categories, d3.schemeTableau10);