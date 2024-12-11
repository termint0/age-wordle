async function incrementGuesses() {
  const guessCount = localStorage.getItem("guessCount") || "0";
  const newCount = Number(guessCount) + 1;
  localStorage.setItem("guessCount", newCount.toString());
}

async function getGameHash(): Promise<number> {
  const resp = await fetch("/api/hash");
  if (resp.status !== 200) {
    return -1;
  }
  const respJson = await resp.json();
  return respJson["hash"] || -1;
}

function onGameTimeout() {
  popupInfo("The game timed out. A new player has been chosen", "close");
}

function makeInitialGuess(): ServerResp[] {
  const item = localStorage.getItem("guesses");
  if (!item) {
    return [];
  }
  const itemJson = JSON.parse(item);
  return itemJson["guesses"];
}

async function loadFromLocalStorage(): Promise<void> {
  const gameHash = await getGameHash();
  if (gameHash.toString() !== localStorage.getItem("hash")) {
    onGameReset();
    localStorage.setItem("hash", gameHash.toString());
  }

  await populateGoalPlayer();

  const givenUp = localStorage.getItem("state") === "givenUp"
  if (givenUp) {
    giveUp();
  }

  const players = makeInitialGuess();

  const playersDiv = document.getElementById("guessed-players");
  if (playersDiv === null) {
    return
  }
  for (const resp of players) {
    playersDiv.prepend(
      createPlayerElement(resp.guessedPlayer, resp.guessEval)
    )
    changeGoalPlayer(resp.goalPlayer);
    if (!givenUp && resp.correct) {
      onCorrectGuess();
    }
  }
  const hints = localStorage.getItem("hints");
  if (hints) {
    const hintsJson = JSON.parse(hints);
    Object.keys(hintsJson).forEach(key => applyHint(key, hintsJson[key]));
  }
}

async function onFirstLoad(): Promise<void> {
  if (localStorage.getItem("attempted")) {
    return;
  }
  localStorage.setItem("attempted", "true");
  fetch("/api/log-start", { method: "POST" });
}

function onGameReset(): void {
  const theme = localStorage.getItem("theme") || "";
  localStorage.clear();
  localStorage.setItem("theme", theme);

  const playersDiv = document.getElementById("guessed-players");
  if (playersDiv === null) {
    return
  }
  playersDiv.innerText = '';
  populateGoalPlayer();
}

async function onPlayerInput(): Promise<void> {
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
  incrementGuesses();
  const resp = await fetch("/api/guess/" + name);
  if (resp.status !== 200) {
    return false;
  }

  const serverResponse = await resp.json() as ServerResp;

  const currGameHash = Number(localStorage.getItem("hash"));
  if (currGameHash && serverResponse.hash !== currGameHash) {
    onGameTimeout();
    onGameReset();
    localStorage.setItem("hash", serverResponse.hash.toString());
    return true;
  }

  localStorage.setItem("hash", serverResponse.hash.toString());
  addGuessedPlayer(serverResponse);
  changeGoalPlayer(serverResponse.goalPlayer);
  if (serverResponse.correct) {
    onCorrectGuess();
  }
  return true;
}


function onCorrectGuess(): void {
  const input = document.getElementById("input-container");
  const congratsElem = document.getElementById("congrats-div");
  const guessCountElem = document.getElementById("guess-count");
  const hintCountElem = document.getElementById("hint-count");
  if (input === null || congratsElem === null || guessCountElem === null || hintCountElem === null) {
    throw new Error("Input area's HTML element names changes aren't reflected in JS!");
  }

  const guessCount = localStorage.getItem("guessCount") || "idk how many (error happened)";
  if (guessCount === "1") {
    guessCountElem.innerText = "1 try"
  } else {
    guessCountElem.innerText = guessCount + " tries"
  }

  const hintCount = localStorage.getItem("hintCount");
  if (hintCount === "1") {
    hintCountElem.innerText = " and used 1 hint";
  } else if (hintCount) {
    hintCountElem.innerText = " and used " + hintCount + " hints";
  }
  

  input.classList.add("hidden");
  congratsElem.classList.remove("hidden");
}

async function onGiveUpClick(): Promise<void> {
  if (await customConfirm("Do you really want to give up?", "Give up", "Keep playing")) {
    giveUp()
  }
}

async function giveUp(): Promise<void> {
  localStorage.setItem("state", "givenUp");
  const resp = await fetch("/api/give-up");
  if (resp.status !== 200) {
    return;
  }
  const respJson = await resp.json() as Player;
  changeGoalPlayer(respJson);

  const input = document.getElementById("input-container");
  const giveUpDiv = document.getElementById("give-up-div")
  if (input === null || giveUpDiv == null) {
    throw new Error("Input area's HTML element names changes aren't reflected in JS!");
  }
  input.classList.add("hidden");
  giveUpDiv.classList.remove("hidden");
}

function onInfoClick(): void {
  const infoTemplate = document.getElementById("info-template") as HTMLTemplateElement;
  popupInfo(infoTemplate.innerHTML, "Okay");
}
