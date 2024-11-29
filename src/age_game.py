import datetime
import json
import logging
from multiprocessing import Value
import random
from typing import Any

import numpy as np
import pandas as pd

YEAR_IN_DAYS = 365.2422
COUNTRY_CODE_FILE = "./resources/countries.json"
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


def get_countries(df: pd.DataFrame) -> pd.DataFrame:
    with open(COUNTRY_CODE_FILE) as f:
        country_codes: dict[str, dict[str, str]] = json.load(f)

    def get_country(code):
        code = code.upper()
        if code not in country_codes:
            return code
        return country_codes[code]["emoji"] + " " + country_codes[code]["name"]

    df["country"] = [list(a.split(",")) for a in df["country"]]
    df["country"] = [
        [get_country(code) for code in lst if code] for lst in df["country"]
    ]
    return df


def get_player_df() -> pd.DataFrame:
    player_df = pd.read_csv(PLAYERS_FILE, delimiter=";")
    player_df = fix_nan(player_df)
    player_df = get_countries(player_df)
    player_df["name_lowercase"] = [a.lower() for a in player_df["name"]]
    player_df["age"] = [get_age(a) for a in player_df["born"]]
    player_df["end_year"] = player_df["end_year"].replace(-1, 100000)
    player_df["teams"] = [
        [a.strip() for a in b.split(",") if a] for b in player_df["teams"]
    ]
    return player_df


def add_aliases(player_df: pd.DataFrame) -> dict[str, str]:
    player_aliases = {}

    for player in player_df.to_dict(orient="records"):
        if not player["spelling"]:
            continue

        for alias in player["spelling"].split(","):
            player_aliases[alias.strip().lower()] = player["name_lowercase"]
    return player_aliases


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


def get_guess_info(player_df: pd.DataFrame, guess: str):
    guess_series: pd.Series = player_df.loc[guess]
    return json.loads(guess_series.to_json())


global_idx = Value("i", 0)


class Game:
    def __init__(self) -> None:
        self.player_df = get_player_df()
        self.player_aliases: dict[str, str] = add_aliases(self.player_df)
        self.player_df = self.player_df.set_index("name_lowercase")
        self.local_idx = 0

        self._set_current(0)
        self._game_hash = hash(self._curr.values())

    def change_player(self):
        logging.info("Changing the player")
        global global_idx
        global_idx.value = random.randint(0, min(50, self.player_df.shape[0]))

    def get_current_player(self) -> dict:
        if self.local_idx != global_idx.value:
            self._set_current(global_idx.value)
        return self._curr

    def get_hash(self) -> int:
        if self.local_idx != global_idx.value:
            self._set_current(global_idx.value)
        return self._game_hash

    def guess(self, name: str) -> dict | None:
        name = name.lower()
        if name not in self.player_df.index:
            if name not in self.player_aliases:
                return None
            name = self.player_aliases[name]
        curr = self.get_current_player()
        correct_guess = name == curr["name"].lower()
        guessed = get_guess_info(self.player_df, name)
        response = {
            "hash": self._game_hash,
            "correct": correct_guess,
            "guessedPlayer": guessed,
            "goalPlayer": get_player_intersection(curr, guessed),
            "guessEval": guess_evaluation(curr, guessed),
        }
        return response

    def _set_current(self, idx: int) -> None:
        curr_series: pd.Series = self.player_df.iloc[idx]
        self._curr: dict[str, Any] = json.loads(curr_series.to_json())
        self.local_idx = idx
        self._game_hash = hash(self._curr.values())
