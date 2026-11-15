"use client";
import { useEffect, useState } from "react";

const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" }
] as const;

const accents = [
  { id: "violet", label: "Violet", swatch: "#7653d6" },
  { id: "blue", label: "Blue", swatch: "#326dcc" },
  { id: "emerald", label: "Emerald", swatch: "#198363" },
  { id: "rose", label: "Rose", swatch: "#c34d71" },
  { id: "orange", label: "Orange", swatch: "#c45c27" },
  { id: "amber", label: "Amber", swatch: "#a76a0a" },
  { id: "cyan", label: "Cyan", swatch: "#137f91" },
  { id: "red", label: "Red", swatch: "#bd414b" },
  { id: "neutral", label: "Neutral", swatch: "#34343a" }
] as const;

export function ThemeControl() {
  const [theme, setTheme] = useState("system");
  const [accent, setAccent] = useState("violet");

  useEffect(() => {
    const applyPreferences = () => {
      const savedTheme = localStorage.getItem("hero-theme");
      const savedAccent = localStorage.getItem("hero-accent");
      const nextTheme = themes.some(option => option.id === savedTheme) ? savedTheme! : "system";
      const nextAccent = accents.some(option => option.id === savedAccent) ? savedAccent! : "violet";
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.dataset.accent = nextAccent;
      setTheme(nextTheme);
      setAccent(nextAccent);
    };

    applyPreferences();
    window.addEventListener("storage", applyPreferences);
    return () => window.removeEventListener("storage", applyPreferences);
  }, []);

  function updateTheme(next: string) {
    setTheme(next);
    localStorage.setItem("hero-theme", next);
    document.documentElement.dataset.theme = next;
  }

  function updateAccent(next: string) {
    setAccent(next);
    localStorage.setItem("hero-accent", next);
    document.documentElement.dataset.accent = next;
  }

  return <div className="theme-settings">
    <div className="field" style={{ maxWidth: 420, marginTop: 16 }}>
      <span className="field-label" id="appearance-label">Appearance</span>
      <div className="segmented-control" role="radiogroup" aria-labelledby="appearance-label">
        {themes.map(option => <button key={option.id} className="segment" type="button" role="radio" aria-checked={theme === option.id} onClick={() => updateTheme(option.id)}>{option.label}</button>)}
      </div>
    </div>
    <fieldset className="accent-fieldset">
      <legend>Accent color</legend>
      <p className="subtle" style={{ fontSize: 12, margin: "5px 0 0" }}>A restrained highlight for buttons, selections, and progress.</p>
      <div className="accent-options" role="radiogroup" aria-label="Accent color">
        {accents.map(option => <button key={option.id} type="button" role="radio" aria-checked={accent === option.id} aria-label={`${option.label} accent`} className="accent-option" onClick={() => updateAccent(option.id)}>
          <span className="accent-dot" style={{ "--swatch": option.swatch } as React.CSSProperties} />{option.label}
        </button>)}
      </div>
    </fieldset>
  </div>;
}
