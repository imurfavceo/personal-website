const THEME_KEY = "theme-preference";
const MODES = ["light", "dark", "system"];

document.addEventListener("DOMContentLoaded", () => {
  setupMenuToggle();
  setupThemeSwitcher();
  setupWritingToggle();
  setupCardLinks();
});

function setupMenuToggle() {
  const btn = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-nav]");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });
}

function setupThemeSwitcher() {
  const footer = document.querySelector(".footer");
  if (!footer || footer.querySelector("[data-theme-trigger]")) return;

  const switcher = document.createElement("div");
  switcher.className = "theme-switch";
  switcher.innerHTML = `
    <button type="button" class="theme-main" data-theme-trigger aria-expanded="false" aria-label="Toggle theme menu" title="Theme">
      🖥
    </button>
    <div class="theme-options" data-theme-options hidden>
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
    });
  });

  document.addEventListener("click", (evt) => {
    if (!switcher.contains(evt.target)) {
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
  if (show) {
    options.removeAttribute("hidden");
    requestAnimationFrame(() => options.classList.add("is-open"));
  } else {
    options.classList.remove("is-open");
    setTimeout(() => options.setAttribute("hidden", ""), 160);
  }
}

function getSavedMode() {
  const stored = localStorage.getItem(THEME_KEY);
  return MODES.includes(stored) ? stored : "system";
}

function saveMode(mode) {
  localStorage.setItem(THEME_KEY, mode);
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

function setupWritingToggle() {
  const toggle = document.querySelector("[data-writing-toggle]");
  const panels = document.querySelectorAll("[data-writing-panel]");
  if (!toggle || panels.length === 0) return;

  const buttons = Array.from(toggle.querySelectorAll("[data-target]"));
  if (buttons.length === 0) return;

  function activate(targetName) {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.target === targetName;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
    });
    panels.forEach((panel) => {
      const isMatch = panel.dataset.writingPanel === targetName;
      if (isMatch) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activate(btn.dataset.target || "essays");
    });
  });

  activate("essays");
}

function setupCardLinks() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    const link = card.querySelector("a[href]");
    const href = link?.getAttribute("href");
    if (!href) return;

    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");

    const go = (evt) => {
      if (evt.target.closest("a")) return;
      window.location.href = href;
    };

    card.addEventListener("click", go);
    card.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        window.location.href = href;
      }
    });
  });
}
