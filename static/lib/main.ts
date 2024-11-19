interface Player {
  name: string
  age: number
  country: string[]
  start_year: number
  end_year: number
  played_1v1: number
  played_tg: number
  earnings: number
  teams: string[]
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
  teams: boolean[]
};

interface ServerResp {
  correct: boolean
  hash: number
  guessedPlayer: Player
  guessEval: GuessEvaluation
  goalPlayer: Player
};

const CHEVRON_UP = "&#x25B2;" as const;
const CHEVRON_DOWN = "&#x25BC;" as const;
const END_YEAR_PRESENT_VAL = 100000 as const;

async function getGameHash(): Promise<number> {
  const resp = await fetch("/api/hash");
  if (resp.status !== 200) {
    return -1;
  }
  const respJson = await resp.json();
  return respJson["hash"] || -1;
}

async function makeInitialGuess(names: string): Promise<ServerResp[]> {
  if (!names) {
    return [];
  }
  const resp = await fetch("/api/multiguess?names=" + names);
  if (resp.status !== 200) {
    return [];
  }
  const respJson = await resp.json();
  return respJson;
}

async function loadFromLocalStorage() {
  const gameHash = await getGameHash();
  if (gameHash.toString() !== localStorage.getItem("hash")) {
    onGameReset();
    return;
  }

  const playersStr: string = localStorage.getItem("guesses") || ""
  const players = await makeInitialGuess(playersStr);

  const playersDiv = document.getElementById("guessed-players");
  if (playersDiv === null) {
    return
  }
  players.forEach(resp => playersDiv.append(
    createPlayerElement(resp.guessedPlayer, resp.guessEval)
  ))

}

function onGameReset() {
  localStorage.removeItem("hash");
  localStorage.removeItem("guesses");

  const playersDiv = document.getElementById("guessed-players");
  if (playersDiv === null) {
    return
  }
  playersDiv.innerText = '';
}

async function onPlayerInput() {
  const input = document.getElementById("player-input") as null | HTMLInputElement;
  if (input === null) {
    return;
  }
  const player = input.value;
  input.value = "";
  guessPlayer(player).then(ok => {
    input.placeholder = ok ? "" : "player not found"
  })
}

async function guessPlayer(name: string): Promise<boolean> {

  const resp = await fetch("/api/game/" + name);
  if (resp.status !== 200) {
    return false;
  }
  const serverResponse = await resp.json() as ServerResp;

  const currGameHash = Number(localStorage.getItem("hash"));
  if (currGameHash && serverResponse.hash !== currGameHash) {
    onGameReset();
    return true;
  }
  localStorage.setItem("hash", serverResponse.hash.toString());

  if (serverResponse.correct) {
    onCorrectGuess(serverResponse);
  } else {
    onWrongGuess(serverResponse)
  }
  return true;
}


function onCorrectGuess(serverResponse: ServerResp): void {
}

function onWrongGuess(serverResponse: ServerResp): void {
  changeGoalPlayer(serverResponse.goalPlayer);
  addGuessedPlayer(serverResponse.guessedPlayer, serverResponse.guessEval);
}
function changeGoalPlayer(player: Player): void { }
function addGuessedPlayer(player: Player, evaluation: GuessEvaluation): void {
  const playersDiv = document.getElementById("guessed-players");
  if (playersDiv === null) {
    return
  }
  const playerElem = createPlayerElement(player, evaluation);
  playersDiv.prepend(playerElem);
  let lsGuesses = localStorage.getItem("guesses");
  lsGuesses = !lsGuesses ? player.name : lsGuesses + "," + player.name;
  localStorage.setItem("guesses", lsGuesses);
}

function createPlayerElement(player: Player, evaluation: GuessEvaluation) {
  const playerDiv = document.createElement("div");
  playerDiv.classList.add("player", "bevel");

  const nameDiv = document.createElement("div");
  nameDiv.classList.add("name", "font-large", "bold");
  nameDiv.textContent = player.name;

  const playerInfo = document.createElement("div");
  playerInfo.classList.add("player-info");
  playerInfo.append(
    createAgeElement(player, evaluation),
    createStartYearElement(player, evaluation),
    createEndYearElement(player, evaluation),
    createCountriesElement(player, evaluation),
    create1v1sElement(player, evaluation),
    createTgsElement(player, evaluation),
    createEarningsElement(player, evaluation),
    createTeamsElement(player, evaluation)
  )
  playerDiv.append(nameDiv, playerInfo);

  return playerDiv;
}

function createValueElement() {
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

function createValueItem(content: string) {
  const item = document.createElement("div");
  item.classList.add("player-info-value-item");
  item.innerHTML = content;
  return item;
}

function getChevron(num: number): string {
  if (num > 0) {
    return " " + CHEVRON_UP;
  } else if (num < 0) {
    return " " + CHEVRON_DOWN;
  } else {
    return "";
  }
}

function createAgeElement(player: Player, evaluation: GuessEvaluation) {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Age:";
  const values = elem.children[1]
  const content = player.age.toString() + getChevron(evaluation.age);
  const item = createValueItem(content)
  item.classList.add(evaluation.age === 0 ? "correct" : "wrong");
  values.append(
    item
  );
  return elem;
}


function createStartYearElement(player: Player, evaluation: GuessEvaluation) {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Playing since:";
  const values = elem.children[1]
  const content = player.start_year.toString() + getChevron(evaluation.start_year);
  const item = createValueItem(content);
  item.classList.add(evaluation.start_year === 0 ? "correct" : "wrong");
  values.append(
    item
  );
  return elem;
}

function createEndYearElement(player: Player, evaluation: GuessEvaluation) {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Played til:";
  const values = elem.children[1]
  let content: string;
  if (player.end_year === END_YEAR_PRESENT_VAL) {
    content = "present" + getChevron(evaluation.end_year);
  } else {
    content = player.end_year.toString() + getChevron(evaluation.end_year);
  }
  const item = createValueItem(content);
  item.classList.add(evaluation.end_year === 0 ? "correct" : "wrong");
  values.append(
    item
  );
  return elem;
}

function createCountriesElement(player: Player, evaluation: GuessEvaluation) {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Countries:";
  const values = elem.children[1]
  for (let i = 0; i < player.country.length; ++i) {
    const country = player.country[i];
    const correct = evaluation.country[i];
    const item = createValueItem(country);
    item.classList.add(correct ? "correct" : "wrong");
    values.append(item);
  }
  return elem;
}


function create1v1sElement(player: Player, evaluation: GuessEvaluation) {
  const elem = createValueElement();
  elem.children[0].innerHTML = "1v1s played:";
  const values = elem.children[1]
  const content = player.played_1v1.toString() + getChevron(evaluation.played_1v1);
  const item = createValueItem(content);
  item.classList.add(evaluation.played_1v1 === 0 ? "correct" : "wrong");
  values.append(
    item
  );
  return elem;
}

function createTgsElement(player: Player, evaluation: GuessEvaluation) {
  const elem = createValueElement();
  elem.children[0].innerHTML = "TGs played:";
  const values = elem.children[1]
  const content = player.played_tg.toString() + getChevron(evaluation.played_tg);
  const item = createValueItem(content);
  item.classList.add(evaluation.played_tg === 0 ? "correct" : "wrong");
  values.append(
    item
  );
  return elem;
}
function createEarningsElement(player: Player, evaluation: GuessEvaluation) {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Earnings:";
  const values = elem.children[1]
  const content = player.earnings.toString() + getChevron(evaluation.earnings);
  const item = createValueItem(content);
  item.classList.add(evaluation.earnings === 0 ? "correct" : "wrong");
  values.append(
    item
  );
  return elem;
}

function createTeamsElement(player: Player, evaluation: GuessEvaluation) {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Teams:";
  const values = elem.children[1]
  for (let i = 0; i < player.teams.length; ++i) {
    const team = player.teams[i];
    const correct = evaluation.teams[i];
    const item = createValueItem(team);
    item.classList.add(correct ? "correct" : "wrong");
    values.append(item);
  }
  return elem;
}
