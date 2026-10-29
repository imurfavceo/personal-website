const THEME_KEY = "theme-preference";
const MODES = ["light", "dark", "system"];

document.addEventListener("DOMContentLoaded", () => {
  setupMenuToggle();
  setupThemeSwitcher();
});

function setupMenuToggle() {
  const btn = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-nav]");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  const closeOnEscape = (evt) => {
    if (evt.key === "Escape") {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  };
  nav.addEventListener("keydown", closeOnEscape);
  btn.addEventListener("keydown", closeOnEscape);
}

function setupThemeSwitcher() {
  const footer = document.querySelector(".footer");
  if (!footer || footer.querySelector("[data-theme-trigger]")) return;

  const switcher = document.createElement("div");
  switcher.className = "theme-switch";
  switcher.innerHTML = `
    <button type="button" class="theme-main" data-theme-trigger aria-controls="theme-options" aria-expanded="false" aria-label="Toggle theme menu" title="Theme">
      🖥
    </button>
    <div id="theme-options" class="theme-options" data-theme-options hidden>
      <button type="button" data-theme-option="light" aria-label="Light theme" title="Light">☀︎</button>
      <button type="button" data-theme-option="dark" aria-label="Dark theme" title="Dark">☾</button>
      <button type="button" data-theme-option="system" aria-label="System theme" title="System">🖥</button>
    </div>
  `;

  footer.appendChild(switcher);

  const trigger = switcher.querySelector("[data-theme-trigger]");
  const options = switcher.querySelector("[data-theme-options]");
  const optionButtons = switcher.querySelectorAll("[data-theme-option]");

  let mode = getSavedMode();
  applyTheme(mode);
  updateTriggerLabel(trigger, mode);
  updateOptionVisibility(optionButtons, mode);

  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    toggleOptions(trigger, options, !expanded);
  });

  optionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.dataset.themeOption || "system";
      mode = MODES.includes(selected) ? selected : "system";
      saveMode(mode);
      applyTheme(mode);
      updateTriggerLabel(trigger, mode);
      updateOptionVisibility(optionButtons, mode);
      toggleOptions(trigger, options, false);
      trigger.focus();
    });
  });

  document.addEventListener("click", (evt) => {
    if (!switcher.contains(evt.target)) {
      toggleOptions(trigger, options, false);
    }
  });

  switcher.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") {
      toggleOptions(trigger, options, false);
      trigger.focus();
    }
  });

  switcher.addEventListener("focusout", (evt) => {
    if (!switcher.contains(evt.relatedTarget)) {
      toggleOptions(trigger, options, false);
    }
  });

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", () => {
    if (mode === "system") {
      applyTheme(mode);
    }
  });
}

function toggleOptions(trigger, options, show) {
  if (!trigger || !options) return;
  trigger.setAttribute("aria-expanded", String(show));
  options.hidden = !show;
}

function getSavedMode() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return MODES.includes(stored) ? stored : "system";
  } catch (_) {
    return "system";
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch (_) {
    // The theme still applies for this page when storage is unavailable.
  }
}

function applyTheme(mode) {
  const root = document.documentElement;
  const resolved =
    mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
}

function updateTriggerLabel(trigger, mode) {
  if (!trigger) return;
  const symbolMap = { light: "☀︎", dark: "☾", system: "🖥" };
  const symbol = symbolMap[mode] || "🖥";
  trigger.textContent = symbol;
}

function updateOptionVisibility(optionButtons, activeMode) {
  optionButtons.forEach((btn) => {
    const isActive = btn.dataset.themeOption === activeMode;
    if (isActive) {
      btn.setAttribute("hidden", "");
      btn.setAttribute("tabindex", "-1");
      btn.setAttribute("aria-hidden", "true");
    } else {
      btn.removeAttribute("hidden");
      btn.removeAttribute("aria-hidden");
      btn.setAttribute("tabindex", "0");
    }
  });
}
