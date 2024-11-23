var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            return;
        }
        const playersStr = localStorage.getItem("guesses") || "";
        const players = yield makeInitialGuess(playersStr);
        const playersDiv = document.getElementById("guessed-players");
        if (playersDiv === null) {
            return;
        }
        for (const resp of players) {
            playersDiv.append(createPlayerElement(resp.guessedPlayer, resp.guessEval));
            changeGoalPlayer(resp);
            if (resp.correct) {
                onCorrectGuess(resp);
            }
        }
    });
}
function onGameReset() {
    localStorage.removeItem("hash");
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
    });
}
function onCorrectGuess(serverResponse) {
    const input = document.getElementById("player-input");
    const congratsElem = document.getElementById("congrats-div");
    const guessCount = document.getElementById("guess-count");
    if (input === null || congratsElem === null || guessCount === null) {
        throw new Error("Input area's HTML element names changes aren't reflected in JS!");
    }
    guessCount.innerText = localStorage.getItem("guessCount") || "idk how many (error happened)";
    input.classList.add("hidden");
    congratsElem.classList.remove("hidden");
}
