import datetime
from typing import Any
import flask
import json

import pandas as pd

app = flask.Flask(__name__)

YEAR_IN_DAYS = 365.2422
COUNTRY_CODE_FILE = "./country_codes.json"

with open(COUNTRY_CODE_FILE) as f:
    country_codes: dict[str, str] = json.load(f)


def get_age(born_str: str) -> int:
    born = datetime.datetime.strptime(born_str, "%m/%d/%y")
    diff: datetime.timedelta = datetime.datetime.today() - born
    diff_years_flt = diff.days / YEAR_IN_DAYS
    diff_years = int(diff_years_flt)
    return diff_years


def get_player_df() -> pd.DataFrame:
    player_df = pd.read_json("data.json")
    player_df["name_lowercase"] = [a.lower() for a in player_df["name"]]
    player_df["age"] = [get_age(a) for a in player_df["age"]]
    player_df["end_year"] = player_df["end_year"].replace(-1, 100000)
    player_df["country"] = [[a] for a in player_df["country"]]
    player_df["country"] = [
        [country_codes.get(code.upper(), code) for code in lst]
        for lst in player_df["country"]
    ]
    player_df = player_df.set_index("name_lowercase")
    return player_df


player_df = get_player_df()
curr_series: pd.Series = player_df.iloc[2]
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
    guess_series: pd.Series = player_df.loc[guess]
    return json.loads(guess_series.to_json())


def guess_evaluation(goal: dict, guess: dict) -> dict:
    result: dict[str, Any] = {}
    for key in goal.keys():
        goal_val = goal.get(key)
        guess_val = guess.get(key)
        if key in ["country", "teams"]:
            result[key] = [a in goal_val for a in guess_val]
        elif key in [
            "age",
            "start_year",
            "end_year",
            "played_1v1",
            "played_tg",
            "earnings",
        ]:
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
    if name not in player_df.index:
        return None
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


@app.route(
    "/",
)
def index():
    return flask.render_template("index.html")


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
    response = guess(name)
    print(response)
    if response is None:
        return flask.jsonify(error="Player not found"), 404
    return flask.jsonify(response)


@app.route(
    "/api/multiguess",
    # methods=["POST"],
)
def multiguess():
    names = flask.request.args.get("names")
    if names is None:
        return flask.jsonify("Player not found", 404)
    names = names.split(",")
    response = [guess(name) for name in names]
    response = [x for x in response if x]

    return flask.jsonify(response)


app.run(port=8080, debug=True)

# print(get_guess_info("TheViper"))
