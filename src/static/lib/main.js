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
    "earnings": "goal-earnings"
};
const MULTI_ITEM_VALUES = {
    "country": "goal-country",
    "teams": "goal-teams"
};
function getCharWidth() {
    const tgPlayed = document.getElementById("goal-played-tg");
    if (tgPlayed === null) {
        return 10;
    }
    const desc = tgPlayed.previousSibling;
    return desc.offsetWidth / desc.innerText.length;
}
const CHAR_WIDTH = getCharWidth();
const CHAR_WIDTH_LARGE = CHAR_WIDTH * 1.3;
function getInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield fetch("/api/goal-player-info");
        if (resp.status !== 200) {
            throw new Error("Couldn't get goal player info");
        }
        const respJson = yield resp.json();
        return respJson;
    });
}
function createObfuscatedItem() {
    const item = createValueItem("");
    item.classList.add("obfuscated");
    return item;
}
function populateGoalPlayer() {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield getInfo();
        for (const key of Object.keys(SINGLE_ITEM_VALUES)) {
            const valueDiv = document.getElementById(SINGLE_ITEM_VALUES[key]);
            if (key === "name") {
                valueDiv.style.width = (player[key] * CHAR_WIDTH_LARGE).toString() + "px";
                continue;
            }
            const item = createObfuscatedItem();
            item.style.width = (player[key] * CHAR_WIDTH).toString() + "px";
            valueDiv === null || valueDiv === void 0 ? void 0 : valueDiv.append(item);
        }
        for (const key of Object.keys(MULTI_ITEM_VALUES)) {
            const valueDiv = document.getElementById(MULTI_ITEM_VALUES[key]);
            for (const len of player[key]) {
                const item = createObfuscatedItem();
                item.style.width = (len * CHAR_WIDTH).toString() + "px";
                valueDiv === null || valueDiv === void 0 ? void 0 : valueDiv.append(item);
            }
        }
    });
}
function changeGoalPlayer(player) {
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
        const item = valueDiv.children[0];
        item.innerText = valFromInt(player[key]);
        if (key === "end_year" && player[key] === END_YEAR_PRESENT_VAL) {
            item.innerText = "present";
        }
        item.classList.remove("obfuscated");
        item.classList.add("correct");
        item.style.width = "";
    }
    for (const key of Object.keys(MULTI_ITEM_VALUES)) {
        const valueDiv = document.getElementById(MULTI_ITEM_VALUES[key]);
        for (let i = 0; i < valueDiv.children.length; ++i) {
            if (player[key][i] === null) {
                continue;
            }
            const item = valueDiv.children[i];
            item.innerText = player[key][i].toString();
            item.classList.remove("obfuscated");
            item.classList.add("correct");
            item.style.width = "";
        }
    }
}
function getClasses(num) {
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
function addGuessedPlayer(serverResponse) {
    const player = serverResponse.guessedPlayer;
    const evaluation = serverResponse.guessEval;
    const playersDiv = document.getElementById("guessed-players");
    if (playersDiv === null) {
        return;
    }
    const playerElem = createPlayerElement(player, evaluation);
    playersDiv.prepend(playerElem);
    let lsGuesses = localStorage.getItem("guesses");
    lsGuesses = !lsGuesses ? player.name : lsGuesses + "," + player.name;
    localStorage.setItem("guesses", lsGuesses);
}
function createPlayerElement(player, evaluation) {
    const playerDiv = document.createElement("div");
    playerDiv.classList.add("player");
    const nameDiv = document.createElement("div");
    nameDiv.classList.add("name", "font-large", "bold");
    nameDiv.textContent = player.name;
    const playerInfo = document.createElement("div");
    playerInfo.classList.add("player-info");
    playerInfo.append(createAgeElement(player, evaluation), createStartYearElement(player, evaluation), createEndYearElement(player, evaluation), createCountriesElement(player, evaluation), create1v1sElement(player, evaluation), createTgsElement(player, evaluation), createEarningsElement(player, evaluation), createTeamsElement(player, evaluation));
    playerDiv.append(nameDiv, playerInfo);
    return playerDiv;
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
    elem.children[0].innerHTML = "Playing since:";
    const values = elem.children[1];
    const content = valFromInt(player.start_year);
    const item = createValueItem(content);
    item.classList.add(...getClasses(evaluation.start_year));
    values.append(item);
    return elem;
}
function createEndYearElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "Played til:";
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
function createTeamsElement(player, evaluation) {
    const elem = createValueElement();
    elem.children[0].innerHTML = "Teams:";
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
function makeInitialGuess(names) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!names) {
            return [];
        }
        const resp = yield fetch("/api/multiguess?names=" + names);
        if (resp.status !== 200) {
            return [];
        }
        const respJson = yield resp.json();
        return respJson;
    });
}
function loadFromLocalStorage() {
    return __awaiter(this, void 0, void 0, function* () {
        const gameHash = yield getGameHash();
        if (gameHash.toString() !== localStorage.getItem("hash")) {
            onGameReset();
        }
        const givenUp = localStorage.getItem("state") === "givenUp";
        if (givenUp) {
            giveUp();
        }
        const playersStr = localStorage.getItem("guesses") || "";
        const players = yield makeInitialGuess(playersStr);
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
    });
}
function onGameReset() {
    localStorage.removeItem("hash");
    localStorage.removeItem("state");
    localStorage.removeItem("guessCount");
    localStorage.removeItem("guesses");
    const playersDiv = document.getElementById("guessed-players");
    if (playersDiv === null) {
        return;
    }
    playersDiv.innerText = '';
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
function customConfirm(prompt, yesButtonText, noButtonText) {
    return new Promise((resolve) => {
        // Get dialog and buttons by their IDs or classes
        const modal = document.getElementById('modal-prompt');
        const promptDiv = document.getElementById('prompt-text');
        const yesButton = document.getElementById('prompt-yes');
        const noButton = document.getElementById('prompt-no');
        modal.classList.remove("hidden");
        promptDiv.innerText = prompt;
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
        // Cleanup function to hide dialog and remove event listeners
        const cleanup = () => {
            modal.classList.add("hidden");
            yesButton.removeEventListener('click', handleYes);
            noButton.removeEventListener('click', handleNo);
        };
        yesButton.addEventListener('click', handleYes);
        noButton.addEventListener('click', handleNo);
    });
}
function popupInfo(text, buttonText) {
    return new Promise((resolve) => {
        // Get dialog and buttons by their IDs or classes
        const modal = document.getElementById('modal-info');
        const infoDiv = document.getElementById('info-text');
        const button = document.getElementById('info-close');
        modal.classList.remove("hidden");
        infoDiv.innerText = text;
        button.innerText = buttonText;
        // Attach event listeners to resolve the promise
        const close = () => {
            resolve(true);
            cleanup();
        };
        // Cleanup function to hide dialog and remove event listeners
        const cleanup = () => {
            modal.classList.add("hidden");
            button.removeEventListener('click', close);
        };
        button.addEventListener('click', close);
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
function createValueItem(content) {
    const item = document.createElement("div");
    item.classList.add("player-info-value-item");
    item.innerHTML = content;
    return item;
}
function valFromInt(val) {
    if (val === NOT_KNOWN_VAL) {
        return "unknown";
    }
    else {
        return val.toString();
    }
}
const RES_DIR = "/static/res/";
function onThemeSwitch() {
    const oldTheme = localStorage.getItem("theme") || "light";
    const newTheme = oldTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setTheme();
}
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
