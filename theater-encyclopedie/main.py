import re
import json

import requests
from pydantic import BaseModel

BASE_URL = "https://theaterencyclopedie.nl/w/api.php?action=query&format=json"


class CategoryMember(BaseModel):
    pageid: int
    ns: int
    title: str


class Location(BaseModel):
    et_pageid: int
    name: str
    city: str
    location_type: str | None = None
    website: str | None = None


def get_raw_wiki_item(title: str):
    url = f"https://theaterencyclopedie.nl/wiki/{title}?action=raw"

    resp = requests.get(url)
    data = resp.text

    return data


def extract_location_from_wiki(raw_text: str, et_pageid: int = 0) -> Location:
    """
    Extracts the first {{...}} block and creates a Location object.
    """
    # Find the first {{...}} block
    match = re.search(r"\{\{(.*?)\}\}", raw_text, re.DOTALL)
    if not match:
        raise ValueError(f"Warning: No curly braces block found in pageid {et_pageid}")

    block = match.group(1)

    # Split into lines and parse key-value pairs
    data = {}
    for line in block.splitlines():
        line = line.strip()
        if line.startswith("|"):
            if "=" in line:
                key, value = line[1:].split("=", 1)
                data[key.strip()] = value.strip()
    # Map to Location fields
    name = data.get("Naam")
    city = data.get("Plaats")
    location_type = data.get("Type")
    website = data.get("Website")

    return Location(
        et_pageid=et_pageid,
        name=name,
        city=city,
        location_type=location_type,
        website=website,
    )


def get_category_members(category: str) -> list[Location]:
    params = {
        "list": "categorymembers",
        "cmtitle": f"Category:{category}",
        "cmlimit": "max",
    }

    has_more = True
    members = []

    while has_more:
        resp = requests.get(BASE_URL, params=params)
        data = resp.json()

        members.extend(
            [
                CategoryMember(**item)
                for item in data.get("query", {}).get("categorymembers", [])
            ]
        )

        next_page_token = data.get("continue", {}).get("cmcontinue")
        if next_page_token:
            params["cmcontinue"] = next_page_token
        else:
            has_more = False

    return members


def main():
    locations = get_category_members("theaters")

    location_data = []

    for loc in locations:
        raw_wiki = get_raw_wiki_item(loc.title)
        if raw_wiki:
            try:
                location = extract_location_from_wiki(raw_wiki, et_pageid=loc.pageid)
                if location:
                    location_data.append(location)
            except Exception as e:
                print(e)

    with open("data/locations.jsonl", "w", encoding="utf-8") as f:
        for loc in location_data:
            f.write(json.dumps(loc.model_dump(), ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
