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
    """Replaces NaN values with empty string or -1 depending on the
    column type specified in consts at top of the file

    Args:
        df: df to replace NaN in

    Returns: df with "" and -1 replacing NaN

    """
    for column in df.columns:
        if column in STR_COLUMNS or column in LIST_COLUMNS:
            df[column] = df[column].replace(np.nan, "")
            df[column] = df[column].astype(str)
        if column in INT_COLUMNS:
            df[column] = df[column].replace(np.nan, -1)
            df[column] = df[column].astype(int)
    return df


def get_age(born_str: str) -> int:
    """Get age from birth date

    Args:
        born_str: birth date

    Returns: age as int

    """
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
    """Transform "country" column from codes into "<flag> <name>" format

    Args:
        df: df to transform

    Returns: df with flags and names instead of codes

    """
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
    """Reads CSV file stored in PLAYERS_FILE, processes it and returns game-ready pd DataFrame

    Returns: pandas DataFrame with processed infor from PLAYERS_FILE

    """
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
    """Creates a list of player aliases from player df

    Args:
        player_df: DataFrame with "spelling" and "name_lowercase" keys

    Returns: a dictionary in the format {"max": "TheMax", "yo": "Mr_Yo"}

    """
    player_aliases = {}

    for player in player_df.to_dict(orient="records"):
        if not player.get("spelling", None):
            continue

        for alias in player["spelling"].split(","):
            player_aliases[alias.strip().lower()] = player["name_lowercase"]
    return player_aliases


def guess_evaluation(goal: dict, guess: dict) -> dict[str, Any]:
    """Creates an evaluation dictionary for a guess

    Args:
        goal: The player to be guessed today
        guess: The player that has been guessed

    Returns: An evaluation dictionary, whose keys are the same as the players'
            and the values are following depending on the type of the players'
            attribute:

            int: result > 0 if goal[key] > guess[key]
                 result = 0 if goal[key] = guess[key]
                 result < 0 if goal[key] < guess[key]

            str: result = True if goal[key] = guess[key]
                 result = False if goal[key] != guess[key]

            list: list of booleans representing if goal[key][n] is in guess[key]
                  e.g: goal[key] = [TyRanT, SY, aM]
                       guess[key] = [Heresy, aM, TyRanT]

                       result[key] = [True, False, True]

    """
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


def get_goal_player_lengths(player: dict) -> dict[str, int | list[int]]:
    """Creates a dict representing the width in chars once displayed on page

    Args:
        player: the player whose elem lengths to measure

    Returns: a dict with same keys as player and values depending
             on types of player's attributes:

             int: number of player[key]'s digits (e.g. floor(log10(player[key])) + 1)

             str: length of player[key]

             list: list of values applied per previous rules
                e.g. player[key] = [TyRanT, SY] => result[key] = [6, 2]

    """
    result: dict[str, Any] = {}
    for key in player.keys():
        goal_val = player[key]
        if key in ["country", "teams"]:
            result[key] = [len(str(a)) for a in goal_val]
        else:
            result[key] = len(str(goal_val))
    return result


def list_intersect(goal_val: list, guess_val: list) -> list:
    """Creates an intersection of two lists, padding with None

    Args:
        goal_val: list, the result will have its length
        guess_val: list

    Returns: goal_val with None replacing items that aren't in guess_val

    """
    return [x if x in guess_val else None for x in goal_val]


def get_player_intersection(goal: dict, guess: dict) -> dict:
    """Creates an intersection of two dictionaries, padding with None

    Args:
        goal: dict, the result will have its structure
        guess: dict

    Returns: A dict with None where the two dicts differ. list_intersect rules applied to lists.

    """
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


def get_guess_info(player_df: pd.DataFrame, guess: str) -> dict[str, Any]:
    """Gets the row where name_lowercase = guess and makes it jsonifiable (removes np.int64 and stuff)

    Args:
        player_df: df to get row from
        guess: name to guess

    Returns: a jsonifiable dict

    """
    guess_series: pd.Series = player_df.loc[guess]
    return json.loads(guess_series.to_json())


# Index of the current player shared across worker threads
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
        """Changes the player across worker threads to a random player"""
        logging.info("Changing the player")
        global global_idx
        global_idx.value = random.randint(0, min(50, self.player_df.shape[0]))

    def get_current_player(self) -> dict:
        """Checks for player change and returns the current player

        Returns: current player dict

        """
        global global_idx
        if self.local_idx != global_idx.value:
            self._set_current(global_idx.value)
        return self._curr

    def get_hash(self) -> int:
        """Checks for player change and returns the game hash 

        Returns: current game hash 

        """
        global global_idx
        if self.local_idx != global_idx.value:
            self._set_current(global_idx.value)
        return self._game_hash

    def guess(self, name: str) -> dict | None:
        """ Guess the player and return a response

        Args:
            name: the player's name

        Returns: None if game doesn't recognize the name
                 A dict with "hash", "correct", "guessedPlayer", "goalPlayer" and "guessEval" keys
                 for more info about those, check get_player_intersection and guess_evaluation docs

            
        """
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
        """Sets current player to the one at idx
        Args:
            idx: number < self.player_df.shape[0]
        """
        curr_series: pd.Series = self.player_df.iloc[idx]
        self._curr: dict[str, Any] = json.loads(curr_series.to_json())
        self.local_idx = idx
        self._game_hash = hash(self._curr.values())