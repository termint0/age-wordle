interface Player {
  name: string
  age: number
  country: string[]
  start_year: number
  end_year: number
  played_1v1: number
  played_tg: number
  voobly_elo: number
  earnings: number
  teams: string[]
};

interface GoalPlayerLengths {
  name: number
  age: number
  country: number[]
  start_year: number
  end_year: number
  played_1v1: number
  played_tg: number
  voobly_elo: number
  earnings: number
  teams: number[]
};

interface GuessEvaluation {
  name: boolean
  age: number
  country: boolean[]
  start_year: number
  end_year: number
  played_1v1: number
  played_tg: number
  earnings: number
  voobly_elo: number
  teams: boolean[]
};

interface ServerResp {
  correct: boolean
  hash: number
  guessedPlayer: Player
  guessEval: GuessEvaluation
  goalPlayer: Player
};

//const CHEVRON_UP = "&#x25B2;" as const;
//const CHEVRON_DOWN = "&#x25BC;" as const;
const END_YEAR_PRESENT_VAL = 100000 as const;
const NOT_KNOWN_VAL = -1 as const;

/**
 * Creates an HTML Element for one statistic (e.g. Age)
 * with a description div and a value container div
 */
function createValueElement(): HTMLDivElement {
  const mainDiv = document.createElement("div");
  mainDiv.classList.add("player-info-elem");

  const description = document.createElement("div");
  description.classList.add("player-info-description", "bold");

  const value = document.createElement("div");
  value.classList.add("player-info-value");


  mainDiv.appendChild(description);
  mainDiv.appendChild(value);
  return mainDiv;
}

/**
 * Creates an HTML Element for one value (e.g. "TyRanT" in the teams div) with
 * @param content content of the new div
 */
function createValueItem(content: string): HTMLDivElement {
  const item = document.createElement("div");
  item.classList.add("player-info-value-item");
  item.innerHTML = content;
  return item;
}

/**
 * A int to str function that handles unknown values
 */
function valFromInt(val: number): string {
  if (val === NOT_KNOWN_VAL) {
    return "unknown";
  } else {
    return val.toString();
  }
}
