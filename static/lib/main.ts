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

async function loadFromLocalStorage(): Promise<void> {
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
  for (const resp of players) {
    playersDiv.append(
      createPlayerElement(resp.guessedPlayer, resp.guessEval)
    )
    changeGoalPlayer(resp);
    if (resp.correct) {
      onCorrectGuess(resp);
    }
  }

}

function onGameReset(): void {
  localStorage.removeItem("hash");
  localStorage.removeItem("guesses");

  const playersDiv = document.getElementById("guessed-players");
  if (playersDiv === null) {
    return
  }
  playersDiv.innerText = '';
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

  const resp = await fetch("/api/guess/" + name);
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

  addGuessedPlayer(serverResponse);
  changeGoalPlayer(serverResponse);
  if (serverResponse.correct) {
    onCorrectGuess(serverResponse);
    return true;
  }
}


function onCorrectGuess(serverResponse: ServerResp): void {
}

