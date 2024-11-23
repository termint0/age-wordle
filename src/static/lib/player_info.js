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
