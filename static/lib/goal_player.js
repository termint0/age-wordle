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
function changeGoalPlayer(serverResponse) {
    const player = serverResponse.goalPlayer;
    for (const key of Object.keys(SINGLE_ITEM_VALUES)) {
        if (player[key] === null) {
            continue;
        }
        const valueDiv = document.getElementById(SINGLE_ITEM_VALUES[key]);
        if (key === "name") {
            valueDiv.innerText = player[key].toString();
            valueDiv.classList.remove("obfuscated");
            continue;
        }
        const item = valueDiv.children[0];
        item.innerText = player[key].toString();
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
//<div id="goal-age" class="player-info-value"> </div>
//<div id="goal-start-year" class="player-info-value"> </div>
//<div id="goal-end-year" class="player-info-value"> </div>
//<div id="goal-countries" class="player-info-value"> </div>
//<div id="goal-played-1v1s" class="player-info-value"> </div>
//<div id="goal-played-tgs" class="player-info-value"> </div>
//<div id="goal-earnings" class="player-info-value"> </div>
//<div id="goal-teams" class="player-info-value"> </div>
