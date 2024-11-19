var RES_DIR = "/static/res/";
function onThemeSwitch() {
    var oldTheme = localStorage.getItem("theme") || "light";
    var newTheme = oldTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setTheme();
}
function setTheme() {
    var icon = document.getElementById("theme-icon") || null;
    if (icon === null) {
        return;
    }
    var theme = localStorage.getItem("theme") || "light";
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add("theme-" + theme);
    icon.src = RES_DIR + "mode-" + theme + ".svg";
}
