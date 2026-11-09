import { useEffect, useState } from "react";

const DEFAULTS = {
  fontScale: 1,
  grayscale: false,
  highContrast: false,
  darkBackground: false,
  lightBackground: false,
  readableFont: false,
  underlineLinks: false,
  alignText: false,
  speech: false,
  reduceMotion: false,
};

const OPTIONS = [
  ["speech", "fa-file-audio", "Moda Suara", "Speech Mode"],
  ["increase", "fa-magnifying-glass-plus", "Perbesar Teks", "Increase Text"],
  ["decrease", "fa-magnifying-glass-minus", "Perkecil Teks", "Decrease Text"],
  ["grayscale", "fa-barcode", "Skala Abu-Abu", "Grayscale"],
  ["highContrast", "fa-circle-half-stroke", "Kontras Tinggi", "High Contrast"],
  ["reduceMotion", "fa-person-walking-arrow-right", "Kurangi Animasi", "Reduce Motion"],
  ["darkBackground", "fa-eye", "Latar Gelap", "Dark Background"],
  ["lightBackground", "fa-lightbulb", "Latar Terang", "Light Background"],
  ["readableFont", "fa-font", "Tulisan Dapat Dibaca", "Readable Font"],
  ["underlineLinks", "fa-link", "Garis Bawahi Tautan", "Underline Links"],
  ["alignText", "fa-align-left", "Rata Tulisan", "Align Text"],
  ["reset", "fa-rotate-left", "Atur Ulang", "Reset"],
];

const AccessibilityOptions = () => {
  const [settings, setSettings] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("paudhi-accessibility") || "{}") };
    } catch {
      return DEFAULTS;
    }
  });
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("id");
  const english = language === "en";

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${settings.fontScale * 100}%`;
    root.classList.toggle("accessibility-high-contrast", settings.highContrast);
    root.classList.toggle("accessibility-underline-links", settings.underlineLinks);
    root.classList.toggle("accessibility-reduce-motion", settings.reduceMotion);
    root.classList.toggle("accessibility-grayscale", settings.grayscale);
    root.classList.toggle("accessibility-dark-background", settings.darkBackground);
    root.classList.toggle("accessibility-light-background", settings.lightBackground);
    root.classList.toggle("accessibility-readable-font", settings.readableFont);
    root.classList.toggle("accessibility-align-text", settings.alignText);
    try {
      localStorage.setItem("paudhi-accessibility", JSON.stringify(settings));
    } catch {
      // Preferences still work for this session when storage is unavailable.
    }
  }, [settings]);

  useEffect(() => {
    if (!settings.speech || !("speechSynthesis" in window)) return undefined;
    const readAloud = (text) => {
      if (!text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "id" ? "id-ID" : "en-US";
      window.speechSynthesis.speak(utterance);
    };
    const speak = (event) => {
      if (event.target.closest(".accessibility-widget")) return;
      const text = window.getSelection()?.toString().trim() || event.target.closest("p, h1, h2, h3, li, a, button")?.innerText?.trim();
      readAloud(text);
    };
    const navigateWithArrows = (event) => {
      if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
      if (event.target.matches("input, textarea, select, [contenteditable='true']")) return;

      const controls = [...document.querySelectorAll(
        "a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"
      )].filter((element) => element.getClientRects().length > 0 && !element.closest("[aria-hidden='true']"));
      if (!controls.length) return;

      event.preventDefault();
      const currentIndex = controls.indexOf(document.activeElement);
      const movingForward = event.key === "ArrowDown" || event.key === "ArrowRight";
      const nextIndex = currentIndex < 0
        ? (movingForward ? 0 : controls.length - 1)
        : (currentIndex + (movingForward ? 1 : -1) + controls.length) % controls.length;
      const nextControl = controls[nextIndex];
      nextControl.focus();
      const label = nextControl.getAttribute("aria-label")
        || nextControl.innerText?.trim()
        || nextControl.getAttribute("alt")
        || nextControl.getAttribute("placeholder")
        || nextControl.value
        || (nextControl.tagName === "A" ? "Tautan" : "Kontrol");
      const role = nextControl.tagName === "A" ? "tautan" : nextControl.tagName === "BUTTON" ? "tombol" : "kolom isian";
      readAloud(`${label}, ${role}, ${nextIndex + 1} dari ${controls.length}`);
    };
    document.addEventListener("click", speak);
    document.addEventListener("keydown", navigateWithArrows);
    return () => {
      document.removeEventListener("click", speak);
      document.removeEventListener("keydown", navigateWithArrows);
      window.speechSynthesis.cancel();
    };
  }, [settings.speech, language]);

  const activate = (key) => {
    if (key === "increase") setSettings((current) => ({ ...current, fontScale: Math.min(1.5, +(current.fontScale + 0.1).toFixed(1)) }));
    else if (key === "decrease") setSettings((current) => ({ ...current, fontScale: Math.max(1, +(current.fontScale - 0.1).toFixed(1)) }));
    else if (key === "reset") setSettings(DEFAULTS);
    else if (key === "darkBackground") setSettings((current) => ({ ...current, darkBackground: !current.darkBackground, lightBackground: false }));
    else if (key === "lightBackground") setSettings((current) => ({ ...current, lightBackground: !current.lightBackground, darkBackground: false }));
    else setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className={`accessibility-widget ${open ? "is-open" : ""}`}>
      {open && (
        <section id="accessibility-panel" className="accessibility-panel" aria-labelledby="accessibility-heading">
          <header className="accessibility-panel-header"><h2 id="accessibility-heading">{english ? "Tools" : "Sarana"}</h2></header>
          <div className="accessibility-languages" role="group" aria-label="Language">
            <button type="button" className={!english ? "selected" : ""} aria-pressed={!english} onClick={() => setLanguage("id")}>Indonesia</button>
            <button type="button" className={english ? "selected" : ""} aria-pressed={english} onClick={() => setLanguage("en")}>Inggris</button>
          </div>
          <div className="accessibility-options">
            {OPTIONS.map(([key, icon, idLabel, enLabel]) => {
              const active = key in settings && Boolean(settings[key]);
              return (
                <button key={key} type="button" className={`accessibility-option ${active ? "active" : ""}`} aria-pressed={key in settings ? active : undefined} onClick={() => activate(key)}>
                  <i className={`fa-solid ${icon}`} aria-hidden="true" />
                  <span>{english ? enLabel : idLabel}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}
      <button className="accessibility-toggle" type="button" aria-label={open ? "Tutup sarana aksesibilitas" : "Buka sarana aksesibilitas"} aria-expanded={open} aria-controls="accessibility-panel" onClick={() => setOpen((value) => !value)}>
        <i className="fa-solid fa-wheelchair" aria-hidden="true" />
      </button>
    </div>
  );
};

export default AccessibilityOptions;
