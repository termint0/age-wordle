/**
 * Returns a list of classes (colors and chevron if wrong) to add to numerical items.
 */
function getClasses(num: number | undefined): string[] {
  if (num === undefined) {
    return ["wrong"];
  }
  if (num < 0) {
    return ["wrong", "chevron-up"]
  } else if (num > 0) {
    return ["wrong", "chevron-down"]
  } else {
    return ["correct"];
  }
}

/**
 * Adds a player to displayed players and remembers the guess in localStorage
 */
function addGuessedPlayer(serverResponse: ServerResp): void {
  const player = serverResponse.guessedPlayer;
  const evaluation = serverResponse.guessEval;
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

/**
 * Creates the HTML Element from the Player and GuessEvaluation objects
 */
function createPlayerElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const playerDiv = document.createElement("div");
  playerDiv.classList.add("player", "background-blur");

  playerDiv.append(
    createPersonalInfoPiece(player, evaluation),
    createActivityPiece(player, evaluation),
    createGameStatsPiece(player, evaluation),
    createTeamsPiece(player, evaluation),
  )

  playerDiv.lastElementChild.classList.add("last-piece");

  return playerDiv;
}

function createPersonalInfoPiece(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const pieceDiv = createPlayerPiece();
  const description = pieceDiv.children[0];
  description.classList.add("name", "font-large", "bold")
  description.innerHTML = player.name;
  pieceDiv.children[1].append(
    createAgeElement(player, evaluation),
    createCountriesElement(player, evaluation),
    createEarningsElement(player, evaluation),
  )
  return pieceDiv;
}

function createActivityPiece(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const pieceDiv = createPlayerPiece();
  const description = pieceDiv.children[0];
  description.innerHTML = "Active:";
  pieceDiv.children[1].append(
    createStartYearElement(player, evaluation),
    createEndYearElement(player, evaluation),
  )
  return pieceDiv;
}

function createGameStatsPiece(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const pieceDiv = createPlayerPiece();
  const description = pieceDiv.children[0];
  description.innerHTML = "Game Stats:";
  pieceDiv.children[1].append(
    create1v1sElement(player, evaluation),
    createTgsElement(player, evaluation),
    createVooblyElement(player, evaluation),
  )
  return pieceDiv;
}

function createTeamsPiece(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const pieceDiv = createPlayerPiece();
  const description = pieceDiv.children[0];
  description.innerHTML = "Teams:";
  pieceDiv.children[1].append(
    createTeamsElement(player, evaluation)
  )
  return pieceDiv;
}

function createAgeElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Age:";
  const values = elem.children[1]
  const content = valFromInt(player.age)
  const item = createValueItem(content)
  item.classList.add(...getClasses(evaluation.age));
  values.append(
    item
  );
  return elem;
}


function createStartYearElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Since:";
  const values = elem.children[1]
  const content = valFromInt(player.start_year)
  const item = createValueItem(content);
  item.classList.add(...getClasses(evaluation.start_year));
  values.append(
    item
  );
  return elem;
}

function createEndYearElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Til:";
  const values = elem.children[1]
  let content: string;
  if (player.end_year === END_YEAR_PRESENT_VAL) {
    content = "present";
  } else {
    content = player.end_year.toString();
  }
  const item = createValueItem(content);
  item.classList.add(...getClasses(evaluation.end_year));
  values.append(
    item
  );
  return elem;
}

function createCountriesElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
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


function create1v1sElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const elem = createValueElement();
  elem.children[0].innerHTML = "1v1s played:";
  const values = elem.children[1]
  const content = valFromInt(player.played_1v1);
  const item = createValueItem(content);
  item.classList.add(...getClasses(evaluation.played_1v1));
  values.append(
    item
  );
  return elem;
}

function createTgsElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const elem = createValueElement();
  elem.children[0].innerHTML = "TGs played:";
  const values = elem.children[1]
  const content = valFromInt(player.played_tg);
  const item = createValueItem(content);
  item.classList.add(...getClasses(evaluation.played_tg));
  values.append(
    item
  );
  return elem;
}
function createEarningsElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Earnings:";
  const values = elem.children[1]
  const content = valFromInt(player.earnings);
  const item = createValueItem(content);
  item.classList.add(...getClasses(evaluation.earnings));
  values.append(
    item
  );
  return elem;
}

function createVooblyElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const elem = createValueElement();
  elem.children[0].innerHTML = "Voobly ELO:";
  const values = elem.children[1]
  const content = valFromInt(player.voobly_elo);
  const item = createValueItem(content);
  item.classList.add(...getClasses(evaluation.voobly_elo));
  values.append(
    item
  );
  return elem;
}

function createTeamsElement(player: Player, evaluation: GuessEvaluation): HTMLDivElement {
  const elem = createValueElement();
  elem.children[0].innerHTML = "";
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
