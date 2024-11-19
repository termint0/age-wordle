var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
;
;
;
var CHEVRON_UP = "&#x25B2;";
var CHEVRON_DOWN = "&#x25BC;";
var END_YEAR_PRESENT_VAL = 100000;
function getGameHash() {
    return __awaiter(this, void 0, void 0, function () {
        var resp, respJson;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("/api/hash")];
                case 1:
                    resp = _a.sent();
                    if (resp.status !== 200) {
                        return [2 /*return*/, -1];
                    }
                    return [4 /*yield*/, resp.json()];
                case 2:
                    respJson = _a.sent();
                    return [2 /*return*/, respJson["hash"] || -1];
            }
        });
    });
}
function makeInitialGuess(names) {
    return __awaiter(this, void 0, void 0, function () {
        var resp, respJson;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!names) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, fetch("/api/multiguess?names=" + names)];
                case 1:
                    resp = _a.sent();
                    if (resp.status !== 200) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, resp.json()];
                case 2:
                    respJson = _a.sent();
                    return [2 /*return*/, respJson];
            }
        });
    });
}
function loadFromLocalStorage() {
    return __awaiter(this, void 0, void 0, function () {
        var gameHash, playersStr, players, playersDiv;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getGameHash()];
                case 1:
                    gameHash = _a.sent();
                    if (gameHash.toString() !== localStorage.getItem("hash")) {
                        onGameReset();
                        return [2 /*return*/];
                    }
                    playersStr = localStorage.getItem("guesses") || "";
                    return [4 /*yield*/, makeInitialGuess(playersStr)];
                case 2:
                    players = _a.sent();
                    playersDiv = document.getElementById("guessed-players");
                    if (playersDiv === null) {
                        return [2 /*return*/];
                    }
                    players.forEach(function (resp) { return playersDiv.append(createPlayerElement(resp.guessedPlayer, resp.guessEval)); });
                    return [2 /*return*/];
            }
        });
    });
}
function onGameReset() {
    localStorage.removeItem("hash");
    localStorage.removeItem("guesses");
    var playersDiv = document.getElementById("guessed-players");
    if (playersDiv === null) {
        return;
    }
    playersDiv.innerText = '';
}
function onPlayerInput() {
    return __awaiter(this, void 0, void 0, function () {
        var input, player;
        return __generator(this, function (_a) {
            input = document.getElementById("player-input");
            if (input === null) {
                return [2 /*return*/];
            }
            player = input.value;
            input.value = "";
            guessPlayer(player).then(function (ok) {
                input.placeholder = ok ? "" : "player not found";
            });
            return [2 /*return*/];
        });
    });
}
function guessPlayer(name) {
    return __awaiter(this, void 0, void 0, function () {
        var resp, serverResponse, currGameHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("/api/game/" + name)];
                case 1:
                    resp = _a.sent();
                    if (resp.status !== 200) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, resp.json()];
                case 2:
                    serverResponse = _a.sent();
                    currGameHash = Number(localStorage.getItem("hash"));
                    if (currGameHash && serverResponse.hash !== currGameHash) {
                        onGameReset();
                        return [2 /*return*/, true];
                    }
                    localStorage.setItem("hash", serverResponse.hash.toString());
                    if (serverResponse.correct) {
                        onCorrectGuess(serverResponse);
                    }
                    else {
                        onWrongGuess(serverResponse);
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
function onCorrectGuess(serverResponse) {
}
function onWrongGuess(serverResponse) {
    changeGoalPlayer(serverResponse.goalPlayer);
    addGuessedPlayer(serverResponse.guessedPlayer, serverResponse.guessEval);
}
function changeGoalPlayer(player) { }
function addGuessedPlayer(player, evaluation) {
    var playersDiv = document.getElementById("guessed-players");
    if (playersDiv === null) {
        return;
    }
    var playerElem = createPlayerElement(player, evaluation);
    playersDiv.prepend(playerElem);
    var lsGuesses = localStorage.getItem("guesses");
    lsGuesses = !lsGuesses ? player.name : lsGuesses + "," + player.name;
    localStorage.setItem("guesses", lsGuesses);
}
function createPlayerElement(player, evaluation) {
    var playerDiv = document.createElement("div");
    playerDiv.classList.add("player", "bevel");
    var nameDiv = document.createElement("div");
    nameDiv.classList.add("name", "font-large", "bold");
    nameDiv.textContent = player.name;
    var playerInfo = document.createElement("div");
    playerInfo.classList.add("player-info");
    playerInfo.append(createAgeElement(player, evaluation), createStartYearElement(player, evaluation), createEndYearElement(player, evaluation), createCountriesElement(player, evaluation), create1v1sElement(player, evaluation), createTgsElement(player, evaluation), createEarningsElement(player, evaluation), createTeamsElement(player, evaluation));
    playerDiv.append(nameDiv, playerInfo);
    return playerDiv;
}
function createValueElement() {
    var mainDiv = document.createElement("div");
    mainDiv.classList.add("player-info-elem");
    var description = document.createElement("div");
    description.classList.add("player-info-description", "bold");
    var value = document.createElement("div");
    value.classList.add("player-info-value");
    mainDiv.appendChild(description);
    mainDiv.appendChild(value);
    return mainDiv;
}
function createValueItem(content) {
    var item = document.createElement("div");
    item.classList.add("player-info-value-item");
    item.innerHTML = content;
    return item;
}
function getChevron(num) {
    if (num > 0) {
        return " " + CHEVRON_UP;
    }
    else if (num < 0) {
        return " " + CHEVRON_DOWN;
    }
    else {
        return "";
    }
}
function createAgeElement(player, evaluation) {
    var elem = createValueElement();
    elem.children[0].innerHTML = "Age:";
    var values = elem.children[1];
    var content = player.age.toString() + getChevron(evaluation.age);
    var item = createValueItem(content);
    item.classList.add(evaluation.age === 0 ? "correct" : "wrong");
    values.append(item);
    return elem;
}
function createStartYearElement(player, evaluation) {
    var elem = createValueElement();
    elem.children[0].innerHTML = "Playing since:";
    var values = elem.children[1];
    var content = player.start_year.toString() + getChevron(evaluation.start_year);
    var item = createValueItem(content);
    item.classList.add(evaluation.start_year === 0 ? "correct" : "wrong");
    values.append(item);
    return elem;
}
function createEndYearElement(player, evaluation) {
    var elem = createValueElement();
    elem.children[0].innerHTML = "Played til:";
    var values = elem.children[1];
    var content;
    if (player.end_year === END_YEAR_PRESENT_VAL) {
        content = "present" + getChevron(evaluation.end_year);
    }
    else {
        content = player.end_year.toString() + getChevron(evaluation.end_year);
    }
    var item = createValueItem(content);
    item.classList.add(evaluation.end_year === 0 ? "correct" : "wrong");
    values.append(item);
    return elem;
}
function createCountriesElement(player, evaluation) {
    var elem = createValueElement();
    elem.children[0].innerHTML = "Countries:";
    var values = elem.children[1];
    for (var i = 0; i < player.country.length; ++i) {
        var country = player.country[i];
        var correct = evaluation.country[i];
        var item = createValueItem(country);
        item.classList.add(correct ? "correct" : "wrong");
        values.append(item);
    }
    return elem;
}
function create1v1sElement(player, evaluation) {
    var elem = createValueElement();
    elem.children[0].innerHTML = "1v1s played:";
    var values = elem.children[1];
    var content = player.played_1v1.toString() + getChevron(evaluation.played_1v1);
    var item = createValueItem(content);
    item.classList.add(evaluation.played_1v1 === 0 ? "correct" : "wrong");
    values.append(item);
    return elem;
}
function createTgsElement(player, evaluation) {
    var elem = createValueElement();
    elem.children[0].innerHTML = "TGs played:";
    var values = elem.children[1];
    var content = player.played_tg.toString() + getChevron(evaluation.played_tg);
    var item = createValueItem(content);
    item.classList.add(evaluation.played_tg === 0 ? "correct" : "wrong");
    values.append(item);
    return elem;
}
function createEarningsElement(player, evaluation) {
    var elem = createValueElement();
    elem.children[0].innerHTML = "Earnings:";
    var values = elem.children[1];
    var content = player.earnings.toString() + getChevron(evaluation.earnings);
    var item = createValueItem(content);
    item.classList.add(evaluation.earnings === 0 ? "correct" : "wrong");
    values.append(item);
    return elem;
}
function createTeamsElement(player, evaluation) {
    var elem = createValueElement();
    elem.children[0].innerHTML = "Teams:";
    var values = elem.children[1];
    for (var i = 0; i < player.teams.length; ++i) {
        var team = player.teams[i];
        var correct = evaluation.teams[i];
        var item = createValueItem(team);
        item.classList.add(correct ? "correct" : "wrong");
        values.append(item);
    }
    return elem;
}
