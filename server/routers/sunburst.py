from fastapi import APIRouter, HTTPException

import os
import json

router = APIRouter()

dirname = os.path.dirname(__file__)
server_path = lambda filename: os.path.join(dirname, "..", filename)


@router.get("/test/")
def test():
    return "Hello Sunburst"


@router.get("/data/")
async def get_all_sunburst_data():
    """
    Get all sunburst data files at once.

    Returns:
        Dictionary with filename as key and data as value
    """
    try:
        sunburst_dir = server_path(os.path.join("sunburst_data", "sunburst"))

        if not os.path.exists(sunburst_dir):
            raise HTTPException(
                status_code=404, detail="Sunburst data directory not found"
            )

        # Get all JSON files in the directory
        files = [f for f in os.listdir(sunburst_dir) if f.endswith(".json")]

        all_data = {}
        for filename in files:
            file_path = os.path.join(sunburst_dir, filename)
            try:
                with open(file_path, "r", encoding="utf-8") as file:
                    all_data[filename] = json.load(file)
            except json.JSONDecodeError:
                all_data[filename] = {"error": f"Invalid JSON in file '{filename}'"}
            except Exception as e:
                all_data[filename] = {
                    "error": f"Error reading file '{filename}': {str(e)}"
                }

        return all_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading data: {str(e)}")
