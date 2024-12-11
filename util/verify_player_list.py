import json

import pandas as pd

def normalize_name(name: str) -> str:
    return name.lower().replace(" ", "").replace("_", "").replace("-", "")

with open("./resources/possible_players.json") as f:
    players = json.load(f)["players"]

df = pd.read_csv("./resources/aoedle.csv", delimiter=";")

df["name"] = df["name"].map(normalize_name)
for player in players:
    if normalize_name(player) not in df["name"].tolist():
        print("PLAYER MISSING: " + normalize_name(player))

exit(1)


