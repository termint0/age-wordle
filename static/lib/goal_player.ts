const SINGLE_ITEM_VALUES = {
  "name": "goal-name",
  "age": "goal-age",
  "start_year": "goal-start-year",
  "end_year": "goal-end-year",
  "played_1v1": "goal-played-1v1",
  "played_tg": "goal-played-tg",
  "earnings": "goal-earnings"
} as const;

const MULTI_ITEM_VALUES = {
  "country": "goal-country",
  "teams": "goal-teams"
} as const;

const CHAR_WIDTH = 8.4 as const;

async function getInfo(): Promise<GoalPlayerLengths> {
  const resp = await fetch("/api/goal-player-info");
  if (resp.status !== 200) {
    throw new Error("Couldn't get goal player info")
  }
  const respJson = await resp.json() as GoalPlayerLengths;
  return respJson;
}

function createObfuscatedItem(): HTMLDivElement {
  const item = createValueItem("");
  item.classList.add("obfuscated");
  return item;
}

async function populateGoalPlayer(): Promise<void> {
  const player = await getInfo();
  for (const key of Object.keys(SINGLE_ITEM_VALUES)) {
    const valueDiv = document.getElementById(SINGLE_ITEM_VALUES[key])
    const item = createObfuscatedItem();
    item.style.width = (player[key] * CHAR_WIDTH).toString() + "px";
    valueDiv?.append(item);
  }
  for (const key of Object.keys(MULTI_ITEM_VALUES)) {
    const valueDiv = document.getElementById(MULTI_ITEM_VALUES[key])
    for (const len of player[key]) {
      const item = createObfuscatedItem();
      item.style.width = (len * CHAR_WIDTH).toString() + "px";
      valueDiv?.append(item);
    }
  }
}


function changeGoalPlayer(serverResponse: ServerResp): void {
  const player = serverResponse.goalPlayer;
  for (const key of Object.keys(SINGLE_ITEM_VALUES)) {
    if (player[key] === null) {
      continue;
    }
    const valueDiv = document.getElementById(SINGLE_ITEM_VALUES[key]);
    const item = valueDiv.children[0] as HTMLDivElement;
    item.innerText = player[key].toString();
    if (key === "end_year" && player[key] === END_YEAR_PRESENT_VAL) {
      item.innerText = "present"
    }
    item.classList.remove("obfuscated");
    item.classList.add("right");
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
      item.classList.add("right");
      item.style.width = "";
    }
  }
}

//<div id="goal-age" class="player-info-value"> </div>
//<div id="goal-start-year" class="player-info-value"> </div>
//<div id="goal-end-year" class="player-info-value"> </div>
//<div id="goal-countries" class="player-info-value"> </div>
//<div id="goal-played-1v1s" class="player-info-value"> </div>
//<div id="goal-played-tgs" class="player-info-value"> </div>
//<div id="goal-earnings" class="player-info-value"> </div>
//<div id="goal-teams" class="player-info-value"> </div>
