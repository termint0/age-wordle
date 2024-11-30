const SINGLE_ITEM_VALUES = {
  "name": "goal-name",
  "age": "goal-age",
  "start_year": "goal-start-year",
  "end_year": "goal-end-year",
  "played_1v1": "goal-played-1v1",
  "played_tg": "goal-played-tg",
  "voobly_elo": "goal-voobly-elo",
  "earnings": "goal-earnings"
} as const;

const MULTI_ITEM_VALUES = {
  "country": "goal-country",
  "teams": "goal-teams"
} as const;

/**
 * Approximates the width of a character on screen
 */
function getCharWidth() {
  const tgPlayed = document.getElementById("goal-played-tg");
  if (tgPlayed === null) {
    return 10;
  }
  // find the description element
  const desc = tgPlayed.previousSibling as HTMLDivElement;
  return desc.offsetWidth / desc.innerText.length
}

const CHAR_WIDTH = getCharWidth();
const CHAR_WIDTH_LARGE = CHAR_WIDTH * 1.3;

/**
 * Fetches the player info needed to approximate obfuscated elements' widths
 */
async function getInfo(): Promise<GoalPlayerLengths> {
  const resp = await fetch("/api/goal-player-info");
  if (resp.status !== 200) {
    throw new Error("Couldn't get goal player info")
  }
  const respJson = await resp.json() as GoalPlayerLengths;
  return respJson;
}

/**
 * Creates an item initially used for the main player's outline
 */
function createObfuscatedItem(): HTMLDivElement {
  const item = createValueItem("");
  item.classList.add("obfuscated");
  return item;
}

/**
 * Gets the goal player's info from the API and sets the value items' width to match
 */
async function populateGoalPlayer(): Promise<void> {
  const player = await getInfo();
  for (const key of Object.keys(SINGLE_ITEM_VALUES)) {
    const valueDiv = document.getElementById(SINGLE_ITEM_VALUES[key])
    valueDiv.innerText = '';
    if (key === "name") {
      valueDiv.style.width = (player[key] * CHAR_WIDTH_LARGE).toString() + "px";
      continue;
    }
    const item = createObfuscatedItem();
    item.style.width = (player[key] * CHAR_WIDTH).toString() + "px";
    valueDiv?.append(item);
  }
  for (const key of Object.keys(MULTI_ITEM_VALUES)) {
    const valueDiv = document.getElementById(MULTI_ITEM_VALUES[key])
    valueDiv.innerText = '';
    for (const len of player[key]) {
      const item = createObfuscatedItem();
      item.style.width = (len * CHAR_WIDTH).toString() + "px";
      valueDiv?.append(item);
    }
  }
}


/**
 * Updates the goal player's values based on a new guess
 */
function changeGoalPlayer(player: Player): void {
  for (const key of Object.keys(SINGLE_ITEM_VALUES)) {
    if (player[key] === null) {
      continue;
    }
    const valueDiv = document.getElementById(SINGLE_ITEM_VALUES[key]);
    if (key === "name") {
      valueDiv.innerText = player[key].toString();
      valueDiv.classList.remove("obfuscated");
      valueDiv.style.width = "";
      continue;
    }
    const item = valueDiv.children[0] as HTMLDivElement;
    item.innerText = valFromInt(player[key]);
    if (key === "end_year" && player[key] === END_YEAR_PRESENT_VAL) {
      item.innerText = "present"
    }
    item.classList.remove("obfuscated");
    item.classList.add("correct");
    item.style.width = "";
  }

  for (const key of Object.keys(MULTI_ITEM_VALUES)) {
    const valueDiv = document.getElementById(MULTI_ITEM_VALUES[key])
    for (let i = 0; i < valueDiv.children.length; ++i) {
      if (player[key][i] === null) {
        continue;
      }
      const item = valueDiv.children[i] as HTMLDivElement;
      item.innerText = player[key][i].toString();
      item.classList.remove("obfuscated");
      item.classList.add("correct");
      item.style.width = "";
    }
  }
}
