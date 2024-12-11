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

const HINT_ORDER = [["played_1v1", "played_tg", "voobly_elo"], ["start_year", "end_year"], ["earnings"], ["age", "country"], ["teams"]] as const;

const DEFAULT_WIDTH = 80 as const;
const WIDTH_VARIANCE = 20 as const
const LARGE_FONT_DIV_SCALE = 1.4 as const

function getWidth(): number {
  return DEFAULT_WIDTH - (WIDTH_VARIANCE / 2) + WIDTH_VARIANCE * Math.random();
}

/**
 * Fetches the player info needed to approximate obfuscated elements' widths
 */
async function getInfo(): Promise<GoalPlayerLengths> {
  const lsLengths = localStorage.getItem("goalLengths");
  if (lsLengths) {
    return JSON.parse(lsLengths);
  }
  const resp = await fetch("/api/goal-player-info");
  if (resp.status !== 200) {
    throw new Error("Couldn't get goal player info")
  }
  const respJson = await resp.json() as GoalPlayerLengths;
  localStorage.setItem("goalLengths", JSON.stringify(respJson));

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

function setSingleItem(key: string, value: string | number) {
  const valueDiv = document.getElementById(SINGLE_ITEM_VALUES[key]);
  if (key === "name") {
    valueDiv.innerText = value.toString();
    valueDiv.classList.remove("obfuscated");
    valueDiv.style.width = "";
    return;
  }
  const item = valueDiv.children[0] as HTMLDivElement;
  item.innerText = valFromInt(value);
  if (key === "end_year" && value === END_YEAR_PRESENT_VAL) {
    item.innerText = "present"
  }
  item.classList.remove("obfuscated");
  item.classList.add("correct");
  item.style.width = "";
}

function setMultiItem(key: string, value: string[]) {
  const valueDiv = document.getElementById(MULTI_ITEM_VALUES[key])
  for (let i = 0; i < valueDiv.children.length; ++i) {
    if (value[i] === null) {
      continue;
    }
    const item = valueDiv.children[i] as HTMLDivElement;
    item.innerText = value[i].toString();
    item.classList.remove("obfuscated");
    item.classList.add("correct");
    item.style.width = "";
  }
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
      valueDiv.style.width = (getWidth() * LARGE_FONT_DIV_SCALE).toString() + "px";
      continue;
    }
    const item = createObfuscatedItem();
    item.style.width = getWidth().toString() + "px";
    valueDiv?.append(item);
  }
  for (const key of Object.keys(MULTI_ITEM_VALUES)) {
    const valueDiv = document.getElementById(MULTI_ITEM_VALUES[key])
    valueDiv.innerText = '';
    for (const _ of player[key]) {
      const item = createObfuscatedItem();
      item.style.width = getWidth().toString() + "px";
      valueDiv?.append(item);
    }
  }
}


/**
 * Updates the goal player's values based on a new guess
 */
function changeGoalPlayer(player: Player): void {
  for (const key of Object.keys(SINGLE_ITEM_VALUES)) {
    if (player[key] === null || player[key] === undefined) {
      continue;
    }
    setSingleItem(key, player[key]);
  }

  for (const key of Object.keys(MULTI_ITEM_VALUES)) {
    setMultiItem(key, player[key]);
  }
}

function isElemGuessed(key: string) {
  if (key in SINGLE_ITEM_VALUES) {
    let elem = document.getElementById(SINGLE_ITEM_VALUES[key]);
    return !elem.firstElementChild.classList.contains("obfuscated")
  } else if (key in MULTI_ITEM_VALUES) {
    let elem = document.getElementById(MULTI_ITEM_VALUES[key]);
    return Array.from(elem.children)
      .map((e) => !e.classList.contains("obfuscated"))
      .every(x => x);
  }
  throw new Error("DOM element keys changed, could not find: " + key);
}

async function onHintClick(): Promise<void> {
  if (!await customConfirm("Are you sure you want to take a hint? By using it, you're waiving your bragging rights!", "Take the hint", "Keep trying")) {
    return;
  }
  const hints = localStorage.getItem("hintCount") || "0";
  const newCount = Number(hints) + 1;
  localStorage.setItem("hintCount", newCount.toString());


  for (let i = 0; i < HINT_ORDER.length; i++) {
    const group = HINT_ORDER[i];
    if (group.map((key: string) => isElemGuessed(key)).some(x => !x)) {
      hintForGroup(group);
      return;
    }
  }
  popupInfo("You're literally out of hints, maybe try to guess the thing or something", "Okay")
}

async function fetchHint(key: string): Promise<any> {
  const resp = await fetch("/api/hint/" + key);
  const respJson = await resp.json();
  return respJson["value"];
}

function hintForGroup(group: readonly string[]) {
  group.forEach(key => {
    fetchHint(key)
      .then(
        val => {
          const hintLs = localStorage.getItem("hints");
          const hintLsJson = hintLs ? JSON.parse(hintLs) : {};
          hintLsJson[key] = val;
          localStorage.setItem("hints", JSON.stringify(hintLsJson));
          val === null ? null : applyHint(key, val) }
      )
  }
  )
}

function applyHint(key: string, value: any) {
  if (key in SINGLE_ITEM_VALUES) {
    setSingleItem(key, value);
  } else if (key in MULTI_ITEM_VALUES) {
    setMultiItem(key, value);
  }
}
