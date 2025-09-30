import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

dirname = os.path.dirname(__file__)
relative_path = lambda filename: os.path.join(dirname, "..", filename)
router = APIRouter()


class ScenarioRequest(BaseModel):
    scenario: str


class CodeOccurrence(BaseModel):
    code_name: str
    occurrences: int


class ScenarioCodesResponse(BaseModel):
    occurrences: List[CodeOccurrence]
    participants: List[Dict[str, Any]]


@router.get("/test/")
async def test():
    return "Hello Linking"


@router.get("/scenarios/")
def get_scenarios():
    data = json.load(open(relative_path("linking_data/scenarios.json")))
    return data


@router.post("/scenarios/codes_manual/", response_model=ScenarioCodesResponse)
def get_scenario_codes_manual(request: ScenarioRequest):
    scenario = request.scenario
    data = json.load(open(relative_path("linking_data/scenario_codes_manual.json")))
    code_freq = json.load(open(relative_path("linking_data/code_freq.json")))
    node_dict = {code["name"]: code for code in code_freq}

    if scenario not in data:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{scenario}' not found in data"
        )

    codes = data[scenario]
    codes = remove_duplicates(codes)
    codes = [
        c for c in codes if c in node_dict
    ]  # remove codes that are not in code_freq
    node_dict = collect_scenario_children(codes, node_dict)
    root = {
        "name": "root",
        "scenario_children": list(set([c.split("\\")[0] for c in codes])),
    }
    node_dict["root"] = root
    root = dfs_collect_reference(root, node_dict)
    new_node_dict = filter_node_dict(root, node_dict)
    code_w_freq = [
        {
            "code_name": code,
            "occurrences": node_dict[code]["references_count"],
        }
        for code in codes
    ]
    return ScenarioCodesResponse(
        occurrences=code_w_freq,
        participants=list(new_node_dict.values()),
    )


def remove_duplicates(codes):
    no_duplicates = []
    for i in range(len(codes)):
        find_duplicate = False
        for j in range(len(codes)):
            if i != j and codes[i] in codes[j]:
                find_duplicate = True
                break
        if not find_duplicate:
            no_duplicates.append(codes[i])
    return list(set(no_duplicates))


def collect_scenario_children(nodes, node_dict):
    hierarchy = {}
    parent_dict = {}
    for node in nodes:
        for i in range(1, len(node.split("\\"))):
            parent = "\\".join(node.split("\\")[:i])
            child = "\\".join(node.split("\\")[: i + 1])
            if parent not in hierarchy:
                hierarchy[parent] = set()
            hierarchy[parent].add(child)
            if child not in hierarchy:
                hierarchy[child] = set()
                parent_dict[child] = set()
            parent_dict[child].add(parent)
    for node, children in hierarchy.items():
        node_dict[node]["scenario_children"] = list(children)
    return node_dict


def dfs_collect_reference(node, node_dict):
    node["participants"] = set()
    node["references_count"] = 0
    if len(node["scenario_children"]) == 0:
        node_dict[node["name"]]["participants"] = list(
            set([r["participant"] for r in node["references"]])
        )
        node_dict[node["name"]]["references_count"] = len(node["references"])
        return node_dict[node["name"]]
    for child in node["scenario_children"]:
        child = dfs_collect_reference(node_dict[child], node_dict)
        node["participants"].update(child["participants"])
        node["references_count"] += child["references_count"]
    node_dict[node["name"]]["participants"] = list(
        node_dict[node["name"]]["participants"]
    )
    return node_dict[node["name"]]


def filter_node_dict(root, node_dict, new_node_dict={}):
    stack = [root]
    while len(stack) > 0:
        current = stack.pop()
        new_node_dict[current["name"]] = current
        for child in current["scenario_children"]:
            stack.append(node_dict[child])
    return new_node_dict
