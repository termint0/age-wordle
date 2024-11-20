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
