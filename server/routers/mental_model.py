from fastapi import APIRouter
import os
import json
import glob
from collections import defaultdict

router = APIRouter()

dirname = os.path.dirname(__file__)
server_path = lambda filename: os.path.join(dirname, "..", filename)


@router.get("/codebook/")
def get_codebook():
    codebook = json.load(
        open(server_path("mm_data/all_codes.json"), "r", encoding="utf-8")
    )
    return codebook


@router.get("/codebook/parent_tsne/")
def get_codebook_parent_tsne():
    parent_code_tsne = json.load(
        open(server_path("mm_data/code_tsne_1d.json"), "r", encoding="utf-8")
    )
    return parent_code_tsne


@router.get("/mental_model/interview/")
def get_interview_MM():
    interview_MMs = []
    codes = json.load(
        open(server_path("mm_data/all_codes.json"), "r", encoding="utf-8")
    )
    parent_code_dict = {code["name"]: code["parent"] for code in codes}
    code_type_dict = {code["name"]: code["type"] for code in codes}
    all_codes = [code["name"] for code in codes]
    participants = []
    for participant_MM_file in glob.glob(server_path("mm_data/MMs/*.json")):
        with open(participant_MM_file, "r") as f:
            participant_MM = json.load(f)
            participant_MM = list(
                filter(lambda x: x["code_name"] in all_codes, participant_MM)
            )
            participant_MM = list(filter(lambda x: x["mentioned"], participant_MM))
            participant_MM = list(filter(lambda x: x["impact"], participant_MM))
            participant_MM = list(
                filter(
                    lambda x: x["logical_connection"] == "Good"
                    and x["significance"] == "Good"
                    and x["relevance"] == "Good"
                    and x["inference"] == "Good"
                    and x["interpretation"] == "Good"
                    and x["preciseness"] == "Good",
                    participant_MM,
                )
            )
            participant_MM = [
                {
                    "node": mm["code_name"],
                    "parent": (
                        parent_code_dict[mm["code_name"]]
                        if parent_code_dict[mm["code_name"]] != "N/A"
                        else mm["code_name"]
                    ),
                    "classification": code_type_dict.get(mm["code_name"], "Unknown"),
                }
                for mm in participant_MM
            ]
        interview_MMs.append(participant_MM)
        participants.append(participant_MM_file.split("/")[-1].split(".")[0])

    return {"participants": participants, "mental_models": interview_MMs}


@router.get("/mental_model/results/")
def get_mm_results():
    all_MMs = defaultdict(list)
    code_book = json.load(open(server_path("mm_data/all_codes.json")))
    all_codes = [code["name"] for code in code_book]
    parent_code_dict = {}  # from code to parent code
    for code in code_book:
        code_name = code["name"]
        parent_code = code["parent"]
        if parent_code != "N/A":
            parent_code_dict[code_name] = parent_code
        else:
            parent_code_dict[code_name] = code_name
    for participant_MM_file in glob.glob(server_path("mm_data/MMs/*.json")):
        participant_id = participant_MM_file.split("/")[-1].split(".")[0]
        participant_MM = json.load(open(participant_MM_file))
        participant_MM = list(
            filter(lambda x: x["code_name"] in all_codes, participant_MM)
        )
        participant_MM = list(filter(lambda x: x["mentioned"], participant_MM))
        participant_MM = list(filter(lambda x: x["impact"], participant_MM))
        participant_MM = list(
            filter(
                lambda x: x["logical_connection"] == "Good"
                and x["significance"] == "Good"
                and x["relevance"] == "Good"
                and x["inference"] == "Good"
                and x["interpretation"] == "Good"
                and x["preciseness"] == "Good",
                participant_MM,
            )
        )
        # code_names = set([c["code_name"] for c in participant_MM])
        # code_names = set(
        #     [parent_code_dict[c["code_name"]] for c in participant_MM]
        # )  # keep only the parent code
        code_names = set([c["code_name"] for c in participant_MM])
        for c in code_names:
            # all_MMs[c] += 1
            all_MMs[c].append(participant_id)
    return all_MMs
