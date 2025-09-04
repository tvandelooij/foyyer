import time
import json
import requests
from pydantic import BaseModel

import xml.etree.ElementTree as ET
from typing import List
from datetime import datetime

BASE_URL = "https://tin.adlibhosting.com/webapi51/wwwopac.ashx?xmltype=Grouped&database=performTIN"


class Production(BaseModel):
    priref_id: str
    title: str
    discipline: str
    start_date: str
    producer: str
    venue: str
    notes: str = ""
    season: str = ""
    tags: list[str] = []

def process_producer(name: str) -> str:
    """
        Receive a producer name in one of the following formats:

            "Rotterdam, Productiehuis Theater"
            "Tweetakt"
            "Studio, De"
            "C-Takt"
        
        Parse the name so that it becomes:

            "Productiehuis Theater Rotterdam"
            "Tweetakt"
            "De Studio"
            "C-Takt"
    """
    parts = name.split(", ")
    if len(parts) == 2:
        return f"{parts[1]} {parts[0]}"
    return name


def parse_adlib_xml(xml_string: str) -> List[Production]:
    root = ET.fromstring(xml_string)
    productions = []
    for record in root.findall(".//record"):
        priref_id = record.findtext("priref") or record.get("priref") or ""
        title = record.findtext("Title/title") or ""
        discipline = record.findtext("discipline") or ""
        start_date_str = record.findtext("Dating/dating.date.start") or ""
        # Parse start_date_str to timestamp (ISO 8601 format)
        try:
            # Try parsing as YYYY-MM-DD
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").isoformat()
        except (ValueError, TypeError):
            return
        producers = [process_producer(elem.text) for elem in record.findall("producent/company") if elem.text and elem.text != "Buitenlandse Gezelschappen"] or []
        producer = " ? ".join(producers)
        venue = record.findtext("venue") or ""
        notes = record.findtext("notes") or ""

        # Parse Content_subject tags
        seasons = []
        tags = []
        for content_subject in record.findall("Content_subject/content.subject"):
            val = content_subject.text
            if val:
                if "seizoen" in val.lower():
                    seasons.append(val.lower().replace("seizoen ", "").strip())
                else:
                    tags.append(val)

        productions.append(Production(
            priref_id=priref_id,
            title=title,
            discipline=discipline,
            start_date=start_date,
            producer=producer,
            venue=venue,
            notes=notes,
            season=" ? ".join(seasons),
            tags=tags if tags else []
        ))
    return productions


def get_adlib_data(start_date: str, end_date: str):
    params = {
        "search": f"dating.date.start>'{start_date}' AND dating.date.start<'{end_date}'",
        "limit": 500,
        "startfrom": 0
    }

    has_more = True

    all_productions = []

    while has_more:
        print(f"Getting data for {params}")
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()

        data = response.text
        productions = parse_adlib_xml(data)

        if productions:
            all_productions.extend(productions)

        # Check if there are more results
        has_more = len(productions) == params["limit"]
        params["startfrom"] += params["limit"]

        print("Sleeping for 5 seconds...")
        time.sleep(10)

    return all_productions


def main():
    start_date = "2014-01-01"
    end_date = "2025-09-01"
    data = get_adlib_data(start_date, end_date)

    print("Writing data to JSONL...")

    with open("data/productions-2014.jsonl", "w", encoding="utf-8") as f:
        for loc in data:
            f.write(json.dumps(loc.model_dump(), ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()