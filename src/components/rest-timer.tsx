"use client";
import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export function RestTimer() {
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running || seconds <= 0) return; const interval = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000); return () => window.clearInterval(interval); }, [running, seconds]);
  const format = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,"0")}`;
  return <div className="panel" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}><Timer size={17} color="#4d705a"/><span className="subtle" style={{ fontSize: 12 }}>Rest timer</span><strong aria-live="polite" style={{ fontVariantNumeric:"tabular-nums" }}>{format}</strong><div style={{ marginLeft:"auto",display:"flex",gap:6 }}><button className="quiet-button" type="button" onClick={()=>{setSeconds(60);setRunning(false);}}>1 min</button><button className="quiet-button" type="button" onClick={()=>{setSeconds(90);setRunning(false);}}>90 sec</button><button className="outline-button" type="button" onClick={()=>setRunning(value=>!value)}>{running?"Pause":"Start"}</button></div></div>;
}
