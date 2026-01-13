(function () {
  const THEME_KEY = "theme-preference";
  const MODES = ["light", "dark", "system"];

  function resolveMode(stored) {
    const mode = MODES.includes(stored) ? stored : "system";
    if (mode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return mode;
  }

  try {
    const stored = localStorage.getItem(THEME_KEY);
    const resolved = resolveMode(stored);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {
    const fallback = resolveMode("system");
    document.documentElement.setAttribute("data-theme", fallback);
    document.documentElement.style.colorScheme = fallback;
  }
})();
