"use client";
import { useEffect, useState } from "react";

export function ThemeControl() {
  const [theme, setTheme] = useState("system");
  useEffect(() => { const stored = localStorage.getItem("hero-theme") || "system"; setTheme(stored); document.documentElement.dataset.theme = stored; }, []);
  return <div className="field" style={{ maxWidth: 320, marginTop: 14 }}><label htmlFor="theme">Appearance</label><select id="theme" value={theme} onChange={event => { const next = event.target.value; setTheme(next); localStorage.setItem("hero-theme", next); document.documentElement.dataset.theme = next; }}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></div>;
}
