import datetime
import json
import random
import time
from typing import Any

import flask
import numpy as np
import pandas as pd

app = flask.Flask(__name__)

YEAR_IN_DAYS = 365.2422
COUNTRY_CODE_FILE = "./resources/country_codes.json"
PLAYERS_FILE = "./resources/aoedle(1).csv"

INT_COLUMNS = [
    "age",
    "start_year",
    "end_year",
    "played_1v1",
    "played_tg",
    "voobly_elo",
    "earnings",
]
LIST_COLUMNS = ["country", "teams"]
STR_COLUMNS = ["name", "born", "spelling"]

player_aliases: dict[str, str] = {}

with open(COUNTRY_CODE_FILE) as f:
    country_codes: dict[str, str] = json.load(f)


def fix_nan(df: pd.DataFrame) -> pd.DataFrame:
    for column in df.columns:
        if column in STR_COLUMNS or column in LIST_COLUMNS:
            df[column] = df[column].replace(np.nan, "")
            df[column] = df[column].astype(str)
        if column in INT_COLUMNS:
            df[column] = df[column].replace(np.nan, -1)
            df[column] = df[column].astype(int)
    return df


def get_age(born_str: str) -> int:
    if born_str == "":
        return -1
    try:
        born = datetime.datetime.strptime(born_str, "%m/%d/%y")
    except Exception:
        # print(born_str)
        born = datetime.datetime.strptime(born_str, "%Y")
    diff: datetime.timedelta = datetime.datetime.today() - born
    diff_years_flt = diff.days / YEAR_IN_DAYS
    diff_years = int(diff_years_flt)
    return diff_years


def add_aliases(player_df: pd.DataFrame) -> None:
    global player_aliases

    for player in player_df.to_dict(orient="records"):
        if not player["spelling"]:
            continue

        for alias in player["spelling"].split(","):
            player_aliases[alias.strip().lower()] = player["name_lowercase"]


def get_player_df() -> pd.DataFrame:
    player_df = pd.read_csv(PLAYERS_FILE, delimiter=";")
    player_df = fix_nan(player_df)
    player_df["name_lowercase"] = [a.lower() for a in player_df["name"]]
    player_df["age"] = [get_age(a) for a in player_df["born"]]
    player_df["end_year"] = player_df["end_year"].replace(-1, 100000)
    player_df["country"] = [[a] for a in player_df["country"]]
    player_df["country"] = [
        [country_codes.get(str(code).upper(), code) for code in lst if code]
        for lst in player_df["country"]
    ]
    player_df["teams"] = [
        [a.strip() for a in b.split(",") if a] for b in player_df["teams"]
    ]
    add_aliases(player_df)
    player_df = player_df.set_index("name_lowercase")
    return player_df


df = get_player_df()
curr_idx = random.randint(0, min(50, df.shape[0]))
curr_series: pd.Series = df.iloc[curr_idx]
curr: dict[str, Any] = json.loads(curr_series.to_json())

game_hash = hash(curr.values())


def list_intersect(goal_val: list, guess_val: list) -> list:
    return [x if x in guess_val else None for x in goal_val]


def get_player_intersection(goal: dict, guess: dict) -> dict:
    result: dict[str, Any] = {}
    for key in goal.keys():
        goal_val = goal.get(key)
        guess_val = guess.get(key)
        if goal_val == guess_val:
            result[key] = goal_val
        else:
            if isinstance(goal_val, list) and isinstance(guess_val, list):
                result[key] = list_intersect(goal_val, guess_val)
            else:
                result[key] = None

    return result


def get_guess_info(guess: str):
    guess_series: pd.Series = df.loc[guess]
    return json.loads(guess_series.to_json())


def guess_evaluation(goal: dict, guess: dict) -> dict:
    result: dict[str, Any] = {}
    for key in goal.keys():
        goal_val = goal.get(key)
        guess_val = guess.get(key)
        if key in LIST_COLUMNS:
            result[key] = [a in goal_val for a in guess_val]
        elif key in INT_COLUMNS:
            result[key] = goal_val - guess_val
        else:
            result[key] = goal_val == guess_val
    return result


def get_goal_player_lengths(goal: dict) -> dict[str, int | list[int]]:
    result: dict[str, Any] = {}
    for key in goal.keys():
        goal_val = goal[key]
        if key in ["country", "teams"]:
            result[key] = [len(str(a)) for a in goal_val]
        else:
            result[key] = len(str(goal_val))
    return result


def guess(name: str) -> dict | None:
    name = name.lower()
    if name not in df.index:
        if name not in player_aliases:
            return None
        name = player_aliases[name]
    correct_guess = name == curr["name"].lower()
    guessed = get_guess_info(name)
    response = {
        "hash": game_hash,
        "correct": correct_guess,
        "guessedPlayer": guessed,
        "goalPlayer": get_player_intersection(curr, guessed),
        "guessEval": guess_evaluation(curr, guessed),
    }
    return response



@app.route("/api/goal-player-info")
def get_goal_player_info():
    player_info = get_goal_player_lengths(curr)
    return flask.jsonify(player_info)


@app.route(
    "/api/hash",
    # methods=["POST"],
)
def getHash():
    return flask.jsonify({"hash": game_hash})


@app.route(
    "/api/guess/<name>",
    # methods=["POST"],
)
def game(name: str):
    # start_time = time.process_time()
    response = guess(name)
    if response is None:
        return flask.jsonify(error="Player not found"), 404
    # print((time.process_time() - start_time))
    return flask.jsonify(response)


@app.route("/api/multiguess")
def multiguess():
    names = flask.request.args.get("names")
    if names is None:
        return flask.jsonify("Player not found", 404)
    names = names.split(",")
    response = [guess(name) for name in names]
    response = [x for x in response if x]

    return flask.jsonify(response)


@app.route("/api/give-up")
def give_up():
    return flask.jsonify(curr)


if __name__ == "__main__":
    @app.route("/")
    def index():
        return flask.render_template("index.html")

    @app.route("/about")
    def about():
        return flask.render_template("about.html")

    app.run(host="0.0.0.0", port=8080, debug=True)

# print(get_guess_info("TheViper"))
