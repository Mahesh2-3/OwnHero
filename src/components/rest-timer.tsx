"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

const presets = [30, 60, 90, 120];

export function RestTimer() {
  const [seconds, setSeconds] = useState(90);
  const [customSeconds, setCustomSeconds] = useState("90");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) {
      if (seconds <= 0) setRunning(false);
      return;
    }
    const interval = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [running, seconds]);

  const format = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,"0")}`;
  const selectDuration = (duration: number) => {
    setSeconds(duration);
    setCustomSeconds(String(duration));
    setRunning(false);
  };

  return <section className="panel rest-timer-panel" aria-label="Rest timer">
    <div className="rest-timer-readout"><span className="rest-timer-icon"><Timer size={17}/></span><div><span className="rest-timer-label">Rest timer</span><strong aria-live="polite" aria-atomic="true">{format}</strong></div></div>
    <div className="rest-timer-presets" role="group" aria-label="Common rest times">{presets.map(duration => <button key={duration} className={`preset-button ${seconds === duration && !running ? "selected" : ""}`} type="button" aria-pressed={seconds === duration && !running} onClick={() => selectDuration(duration)}>{duration}s</button>)}</div>
    <label className="visually-hidden" htmlFor="custom-rest-duration">Custom rest time in seconds</label><input id="custom-rest-duration" className="rest-timer-custom" type="number" min="1" max="600" step="5" value={customSeconds} onChange={event => { const next = event.target.value; setCustomSeconds(next); const parsed = Number(next); if (next && Number.isFinite(parsed)) setSeconds(Math.min(600, Math.max(1, parsed))); setRunning(false); }} />
    <button className={running ? "outline-button" : "primary-button"} type="button" onClick={() => { if (seconds <= 0) setSeconds(Number(customSeconds) || 90); setRunning(value => !value); }}>{running ? "Pause" : seconds === 0 ? "Restart" : "Start"}</button>
  </section>;
}
