var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const SINGLE_ITEM_VALUES = {
    "name": "goal-name",
    "age": "goal-age",
    "start_year": "goal-start-year",
    "end_year": "goal-end-year",
    "played_1v1": "goal-played-1v1",
    "played_tg": "goal-played-tg",
    "voobly_elo": "goal-voobly-elo",
    "earnings": "goal-earnings"
};
const MULTI_ITEM_VALUES = {
    "country": "goal-country",
    "teams": "goal-teams"
};
const HINT_ORDER = [["played_1v1", "played_tg", "voobly_elo"], ["start_year", "end_year"], ["earnings"], ["age", "country"], ["teams"]];
const DEFAULT_WIDTH = 80;
const WIDTH_VARIANCE = 20;
const LARGE_FONT_DIV_SCALE = 1.4;
function getWidth() {
    return DEFAULT_WIDTH - (WIDTH_VARIANCE / 2) + WIDTH_VARIANCE * Math.random();
}
/**
 * Fetches the player info needed to approximate obfuscated elements' widths
 */
function getInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const lsLengths = localStorage.getItem("goalLengths");
        if (lsLengths) {
            return JSON.parse(lsLengths);
        }
        const resp = yield fetch("/api/goal-player-info");
        if (resp.status !== 200) {
            throw new Error("Couldn't get goal player info");
        }
        const respJson = yield resp.json();
        localStorage.setItem("goalLengths", JSON.stringify(respJson));
        return respJson;
    });
}
/**
 * Creates an item initially used for the main player's outline
 */
function createObfuscatedItem() {
    const item = createValueItem("");
    item.classList.add("obfuscated");
    return item;
}
function setSingleItem(key, value) {
    const valueDiv = document.getElementById(SINGLE_ITEM_VALUES[key]);
    if (key === "name") {
        valueDiv.innerText = value.toString();
        valueDiv.classList.remove("obfuscated");
        valueDiv.style.width = "";
        return;
    }
    const item = valueDiv.children[0];
    item.innerText = valFromInt(value);
    if (key === "end_year" && value === END_YEAR_PRESENT_VAL) {
        item.innerText = "present";
    }
    item.classList.remove("obfuscated");
    item.classList.add("correct");
    item.style.width = "";
}
function setMultiItem(key, value) {
    const valueDiv = document.getElementById(MULTI_ITEM_VALUES[key]);
    for (let i = 0; i < valueDiv.children.length; ++i) {
        if (value[i] === null) {
            continue;
        }
        const item = valueDiv.children[i];
        item.innerText = value[i].toString();
        item.classList.remove("obfuscated");
        item.classList.add("correct");
        item.style.width = "";
    }
}
/**
 * Gets the goal player's info from the API and sets the value items' width to match
 */
function populateGoalPlayer() {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield getInfo();
        for (const key of Object.keys(SINGLE_ITEM_VALUES)) {
            const valueDiv = document.getElementById(SINGLE_ITEM_VALUES[key]);
            valueDiv.innerText = '';
            if (key === "name") {
                valueDiv.style.width = (getWidth() * LARGE_FONT_DIV_SCALE).toString() + "px";
                continue;
            }
            const item = createObfuscatedItem();
            item.style.width = getWidth().toString() + "px";
            valueDiv === null || valueDiv === void 0 ? void 0 : valueDiv.append(item);
        }
        for (const key of Object.keys(MULTI_ITEM_VALUES)) {
            const valueDiv = document.getElementById(MULTI_ITEM_VALUES[key]);
            valueDiv.innerText = '';
            for (const _ of player[key]) {
                const item = createObfuscatedItem();
                item.style.width = getWidth().toString() + "px";
                valueDiv === null || valueDiv === void 0 ? void 0 : valueDiv.append(item);
            }
        }
    });
}
/**
 * Updates the goal player's values based on a new guess
 */
function changeGoalPlayer(player) {
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
function isElemGuessed(key) {
    if (key in SINGLE_ITEM_VALUES) {
        let elem = document.getElementById(SINGLE_ITEM_VALUES[key]);
        return !elem.firstElementChild.classList.contains("obfuscated");
    }
    else if (key in MULTI_ITEM_VALUES) {
        let elem = document.getElementById(MULTI_ITEM_VALUES[key]);
        return Array.from(elem.children)
            .map((e) => !e.classList.contains("obfuscated"))
            .every(x => x);
    }
    throw new Error("DOM element keys changed, could not find: " + key);
}
function onHintClick() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield customConfirm("Are you sure you want to take a hint? By using it, you're waiving your bragging rights!", "Take the hint", "Keep trying"))) {
            return;
        }
        const hints = localStorage.getItem("hintCount") || "0";
        const newCount = Number(hints) + 1;
        localStorage.setItem("hintCount", newCount.toString());
        for (let i = 0; i < HINT_ORDER.length; i++) {
            const group = HINT_ORDER[i];
            if (group.map((key) => isElemGuessed(key)).some(x => !x)) {
                hintForGroup(group);
                return;
            }
        }
        popupInfo("You're literally out of hints, maybe try to guess the thing or something", "Okay");
    });
}
function fetchHint(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield fetch("/api/hint/" + key);
        const respJson = yield resp.json();
        return respJson["value"];
    });
}
function hintForGroup(group) {
    group.forEach(key => {
        fetchHint(key)
            .then(val => {
            const hintLs = localStorage.getItem("hints");
            const hintLsJson = hintLs ? JSON.parse(hintLs) : {};
            hintLsJson[key] = val;
            localStorage.setItem("hints", JSON.stringify(hintLsJson));
            val === null ? null : applyHint(key, val);
        });
    });
}
function applyHint(key, value) {
    if (key in SINGLE_ITEM_VALUES) {
        setSingleItem(key, value);
    }
    else if (key in MULTI_ITEM_VALUES) {
        setMultiItem(key, value);
    }
}
/**
 * Returns a list of classes (colors and chevron if wrong) to add to numerical items.
 */
function getClasses(num) {
    if (num === undefined) {
        return ["wrong"];
    }
    if (num < 0) {
        return ["wrong", "chevron-up"];
    }
    else if (num > 0) {
        return ["wrong", "chevron-down"];
    }
    else {
        return ["correct"];
    }
}
/**
 * Adds a player to displayed players and remembers the guess in localStorage
 */
function addGuessedPlayer(serverResponse) {
    const player = serverResponse.guessedPlayer;
    const evaluation = serverResponse.guessEval;
    const playersDiv = document.getElementById("guessed-players");
    if (playersDiv === null) {
        return;
    }
    const playerElem = createPlayerElement(player, evaluation);
    playersDiv.prepend(playerElem);
    const lsGuesses = localStorage.getItem("guesses");
    const lsGuessesJson = lsGuesses ? JSON.parse(lsGuesses) : { "guesses": [] };
    lsGuessesJson["guesses"].push(serverResponse);
    localStorage.setItem("guesses", JSON.stringify(lsGuessesJson));
}
/**
 * Creates the HTML Element from the Player and GuessEvaluation objects
 */
function createPlayerElement(player, evaluation) {
    const playerDiv = document.createElement("div");
    playerDiv.classList.add("player", "background-blur");
    playerDiv.append(createPersonalInfoPiece(player, evaluation), createActivityPiece(player, evaluation), createGameStatsPiece(player, evaluation), createTeamsPiece(player, evaluation));
    return playerDiv;
}
function createPersonalInfoPiece(player, evaluation) {
    const pieceDiv = createPlayerPiece();
    const description = pieceDiv.children[0];
    description.classList.remove("font-medium");
    description.classList.add("name", "font-large", "bold");
    description.innerHTML = player.name;
    pieceDiv.children[1].append(createAgeElement(player, evaluation), createCountriesElement(player, evaluation), createEarningsElement(player, evaluation));
    return pieceDiv;
}
function createActivityPiece(player, evaluation) {
    const pieceDiv = createPlayerPiece();
    const description = pieceDiv.children[0];
    description.innerHTML = "Active:";
    pieceDiv.children[1].append(createStartYearElement(player, evaluation), createEndYearElement(player, evaluation));
    return pieceDiv;
}
function createGameStatsPiece(player, evaluation) {
    const pieceDiv = createPlayerPiece();
    const description = pieceDiv.children[0];
    description.innerHTML = "Game Stats:";
    pieceDiv.children[1].append(create1v1sElement(player, evaluation), createTgsElement(player, evaluation), createVooblyElement(player, evaluation));
    return pieceDiv;
}
function createTeamsPiece(player, evaluation) {
    const pieceDiv = createPlayerPiece();
    const description = pieceDiv.children[0];
    description.innerHTML = "Teams:";
    pieceDiv.children[1].append(createTeamsElement(player, evaluation));
    return pieceDiv;
}
function createAgeElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "Age:";
    const values = elem.children[1];
    const content = valFromInt(player.age);
    const item = createValueItem(content);
    item.classList.add(...getClasses(evaluation.age));
    values.append(item);
    return elem;
}
function createStartYearElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "Since:";
    const values = elem.children[1];
    const content = valFromInt(player.start_year);
    const item = createValueItem(content);
    item.classList.add(...getClasses(evaluation.start_year));
    values.append(item);
    return elem;
}
function createEndYearElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "Til:";
    const values = elem.children[1];
    let content;
    if (player.end_year === END_YEAR_PRESENT_VAL) {
        content = "present";
    }
    else {
        content = player.end_year.toString();
    }
    const item = createValueItem(content);
    item.classList.add(...getClasses(evaluation.end_year));
    values.append(item);
    return elem;
}
function createCountriesElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "Countries:";
    const values = elem.children[1];
    for (let i = 0; i < player.country.length; ++i) {
        const country = player.country[i];
        const correct = evaluation.country[i];
        const item = createValueItem(country);
        item.classList.add(correct ? "correct" : "wrong");
        values.append(item);
    }
    return elem;
}
function create1v1sElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "1v1s played:";
    const values = elem.children[1];
    const content = valFromInt(player.played_1v1);
    const item = createValueItem(content);
    item.classList.add(...getClasses(evaluation.played_1v1));
    values.append(item);
    return elem;
}
function createTgsElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "TGs played:";
    const values = elem.children[1];
    const content = valFromInt(player.played_tg);
    const item = createValueItem(content);
    item.classList.add(...getClasses(evaluation.played_tg));
    values.append(item);
    return elem;
}
function createEarningsElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "Earnings:";
    const values = elem.children[1];
    const content = valFromInt(player.earnings);
    const item = createValueItem(content);
    item.classList.add(...getClasses(evaluation.earnings));
    values.append(item);
    return elem;
}
function createVooblyElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "Voobly ELO:";
    const values = elem.children[1];
    const content = valFromInt(player.voobly_elo);
    const item = createValueItem(content);
    item.classList.add(...getClasses(evaluation.voobly_elo));
    values.append(item);
    return elem;
}
function createTeamsElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "";
    const values = elem.children[1];
    for (let i = 0; i < player.teams.length; ++i) {
        const team = player.teams[i];
        const correct = evaluation.teams[i];
        const item = createValueItem(team);
        item.classList.add(correct ? "correct" : "wrong");
        values.append(item);
    }
    return elem;
}
function incrementGuesses() {
    return __awaiter(this, void 0, void 0, function* () {
        const guessCount = localStorage.getItem("guessCount") || "0";
        const newCount = Number(guessCount) + 1;
        localStorage.setItem("guessCount", newCount.toString());
    });
}
function getGameHash() {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield fetch("/api/hash");
        if (resp.status !== 200) {
            return -1;
        }
        const respJson = yield resp.json();
        return respJson["hash"] || -1;
    });
}
function onGameTimeout() {
    popupInfo("The game timed out. A new player has been chosen", "close");
}
function makeInitialGuess() {
    const item = localStorage.getItem("guesses");
    if (!item) {
        return [];
    }
    const itemJson = JSON.parse(item);
    return itemJson["guesses"];
}
function loadFromLocalStorage() {
    return __awaiter(this, void 0, void 0, function* () {
        const gameHash = yield getGameHash();
        if (gameHash.toString() !== localStorage.getItem("hash")) {
            onGameReset();
            localStorage.setItem("hash", gameHash.toString());
        }
        yield populateGoalPlayer();
        const givenUp = localStorage.getItem("state") === "givenUp";
        if (givenUp) {
            giveUp();
        }
        const players = makeInitialGuess();
        const playersDiv = document.getElementById("guessed-players");
        if (playersDiv === null) {
            return;
        }
        for (const resp of players) {
            playersDiv.prepend(createPlayerElement(resp.guessedPlayer, resp.guessEval));
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
    });
}
function onFirstLoad() {
    return __awaiter(this, void 0, void 0, function* () {
        if (localStorage.getItem("attempted")) {
            return;
        }
        localStorage.setItem("attempted", "true");
        fetch("/api/log-start", { method: "POST" });
    });
}
function onGameReset() {
    const theme = localStorage.getItem("theme") || "";
    localStorage.clear();
    localStorage.setItem("theme", theme);
    const playersDiv = document.getElementById("guessed-players");
    if (playersDiv === null) {
        return;
    }
    playersDiv.innerText = '';
    populateGoalPlayer();
}
function onPlayerInput() {
    return __awaiter(this, void 0, void 0, function* () {
        const input = document.getElementById("player-input");
        if (input === null) {
            return;
        }
        const player = input.value;
        input.value = "";
        guessPlayer(player).then(ok => {
            input.placeholder = ok ? "" : "player not found";
        });
    });
}
function guessPlayer(name) {
    return __awaiter(this, void 0, void 0, function* () {
        incrementGuesses();
        const resp = yield fetch("/api/guess/" + name);
        if (resp.status !== 200) {
            return false;
        }
        const serverResponse = yield resp.json();
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
    });
}
function onCorrectGuess() {
    const input = document.getElementById("input-container");
    const congratsElem = document.getElementById("congrats-div");
    const guessCountElem = document.getElementById("guess-count");
    if (input === null || congratsElem === null || guessCountElem === null) {
        throw new Error("Input area's HTML element names changes aren't reflected in JS!");
    }
    const guessCount = localStorage.getItem("guessCount") || "idk how many (error happened)";
    if (guessCount === "1") {
        guessCountElem.innerText = "1 try";
    }
    else {
        guessCountElem.innerText = guessCount + " tries";
    }
    input.classList.add("hidden");
    congratsElem.classList.remove("hidden");
}
function onGiveUpClick() {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield customConfirm("Do you really want to give up?", "Give up", "Keep playing")) {
            giveUp();
        }
    });
}
function giveUp() {
    return __awaiter(this, void 0, void 0, function* () {
        localStorage.setItem("state", "givenUp");
        const resp = yield fetch("/api/give-up");
        if (resp.status !== 200) {
            return;
        }
        const respJson = yield resp.json();
        changeGoalPlayer(respJson);
        const input = document.getElementById("input-container");
        const giveUpDiv = document.getElementById("give-up-div");
        if (input === null || giveUpDiv == null) {
            throw new Error("Input area's HTML element names changes aren't reflected in JS!");
        }
        input.classList.add("hidden");
        giveUpDiv.classList.remove("hidden");
    });
}
function onInfoClick() {
    const infoTemplate = document.getElementById("info-template");
    popupInfo(infoTemplate.innerHTML, "Okay");
}
function customConfirm(prompt, yesButtonText, noButtonText) {
    return new Promise((resolve) => {
        // Get dialog and buttons by their IDs or classes
        const modal = document.getElementById('modal-prompt');
        const promptDiv = document.getElementById('prompt-text');
        const yesButton = document.getElementById('prompt-yes');
        const noButton = document.getElementById('prompt-no');
        modal.classList.remove("hidden");
        promptDiv.innerHTML = prompt;
        yesButton.innerText = yesButtonText;
        noButton.innerText = noButtonText;
        // Attach event listeners to resolve the promise
        const handleYes = () => {
            resolve(true);
            cleanup();
        };
        const handleNo = () => {
            resolve(false);
            cleanup();
        };
        const keydown = (event) => {
            if (event.key === "Escape")
                handleNo();
        };
        // Cleanup function to hide dialog and remove event listeners
        const cleanup = () => {
            modal.classList.add("hidden");
            yesButton.removeEventListener('click', handleYes);
            noButton.removeEventListener('click', handleNo);
            document.removeEventListener('keydown', keydown);
        };
        yesButton.addEventListener('click', handleYes);
        noButton.addEventListener('click', handleNo);
        document.addEventListener('keydown', keydown);
    });
}
function popupInfo(text, buttonText) {
    return new Promise((resolve) => {
        // Get dialog and buttons by their IDs or classes
        const modal = document.getElementById('modal-info');
        const infoDiv = document.getElementById('info-text');
        const button = document.getElementById('info-close');
        modal.classList.remove("hidden");
        if (text) {
            infoDiv.innerHTML = text;
        }
        if (buttonText) {
            button.innerText = buttonText;
        }
        // Attach event listeners to resolve the promise
        const close = () => {
            resolve(true);
            cleanup();
        };
        const keydown = (event) => {
            if (event.key === "Enter" || event.key === "Escape")
                close();
        };
        // Cleanup function to hide dialog and remove event listeners
        const cleanup = () => {
            modal.classList.add("hidden");
            button.removeEventListener('click', close);
            document.removeEventListener('keydown', keydown);
        };
        button.addEventListener('click', close);
        document.addEventListener('keydown', keydown);
    });
}
;
;
;
;
//const CHEVRON_UP = "&#x25B2;" as const;
//const CHEVRON_DOWN = "&#x25BC;" as const;
const END_YEAR_PRESENT_VAL = 100000;
const NOT_KNOWN_VAL = -1;
function createPlayerPiece() {
    const groupPiece = document.createElement("div");
    groupPiece.classList.add("player-div-piece");
    const description = document.createElement("div");
    description.classList.add("font-medium", "player-div-piece-description");
    const infoGroup = document.createElement("div");
    infoGroup.classList.add("player-info-group");
    groupPiece.append(description, infoGroup);
    return groupPiece;
}
/**
 * Creates an HTML Element for one statistic (e.g. Age)
 * with a description div and a value container div
 */
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
/**
 * Creates an HTML Element for one value (e.g. "TyRanT" in the teams div) with
 * @param content content of the new div
 */
function createValueItem(content) {
    const item = document.createElement("div");
    item.classList.add("player-info-value-item");
    item.innerHTML = content;
    return item;
}
/**
 * A int to str function that handles unknown values
 */
function valFromInt(val) {
    if (val === NOT_KNOWN_VAL) {
        return "unknown";
    }
    else {
        return val.toString();
    }
}
const RES_DIR = "/static/res/";
/**
 * Switches theme and saves the result in localStorage
 */
function onThemeSwitch() {
    const oldTheme = localStorage.getItem("theme") || "light";
    const newTheme = oldTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setTheme();
}
/**
 * Sets theme based on localStorage
 */
function setTheme() {
    const icon = document.getElementById("theme-icon") || null;
    if (icon === null) {
        return;
    }
    const theme = localStorage.getItem("theme") || "light";
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add("theme-" + theme);
    icon.src = RES_DIR + "mode-" + theme + ".svg";
}
