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

async function loadFromLocalStorage(): Promise<void> {
  const gameHash = await getGameHash();
  if (gameHash.toString() !== localStorage.getItem("hash")) {
    onGameReset();
  }

  const givenUp = localStorage.getItem("state") === "givenUp"
  if (givenUp) {
    giveUp();
  }

  const playersStr: string = localStorage.getItem("guesses") || ""
  const players = await makeInitialGuess(playersStr);

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
}

async function onFirstLoad(): Promise<void> {
  if (localStorage.getItem("attempted")) {
    return;
  }
  localStorage.setItem("attempted", "true");
  fetch("/api/log-start", {method: "POST"});
} 

function onGameReset(): void {
  localStorage.removeItem("hash");
  localStorage.removeItem("state");
  localStorage.removeItem("guessCount");
  localStorage.removeItem("guesses");

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
  if (input === null || congratsElem === null || guessCountElem === null) {
    throw new Error("Input area's HTML element names changes aren't reflected in JS!");
  }

  const guessCount = localStorage.getItem("guessCount") || "idk how many (error happened)";
  if (guessCount === "1") {
    guessCountElem.innerText = "1 try"
  } else {
    guessCountElem.innerText = guessCount + " tries"
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
