import os

from convex import ConvexClient
from dotenv import load_dotenv
import json


if __name__ == "__main__":
    load_dotenv(".env")

    client = ConvexClient(os.getenv("CONVEX_URL"))

    print(os.getenv("CONVEX_URL"))

    with open("data/productions-2509.jsonl", "r", encoding="utf-8") as f:
        for line in f:
            production = json.loads(line)

            result = client.query(
                "productions:getByPrirefId", {"priref_id": production["priref_id"]}
            )

            if len(result) == 0:
                print(
                    f"Importing production {production['priref_id']}: {production['title']}"
                )
                client.mutation("productions:addProduction", production)
