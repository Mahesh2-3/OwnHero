import Link from "next/link";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { startWorkout } from "@/app/actions";
import { Check, Circle, Clock3, Plus, Sparkles } from "lucide-react";
import { calculateScheduledStreak } from "@/lib/analytics";
import { fromKilograms, type WeightUnit } from "@/lib/units";

function dateForZone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long", year: "numeric", month: "long", day: "numeric" }).formatToParts(date);
  return Object.fromEntries(parts.map(p => [p.type, p.value]));
}

function dateKeyForZone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const settings = await prisma.userSettings.upsert({ where: { userId }, create: { userId }, update: {} });
  const today = dateForZone(new Date(), settings.timezone);
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekday = weekdays.indexOf(today.weekday);
  const [plan, sessions, profile, totalCompleted] = await Promise.all([
    prisma.workoutPlan.findFirst({ where: { userId, active: true, archived: false }, include: { days: { include: { exercises: { orderBy: { sortOrder: "asc" } } } } } }),
    prisma.workoutSession.findMany({ where: { userId, status: "COMPLETED" }, orderBy: { completedAt: "desc" }, take: 100, select: { id: true, title: true, planId: true, completedAt: true } }),
    prisma.fitnessProfile.findUnique({ where: { userId } }),
    prisma.workoutSession.count({ where: { userId, status: "COMPLETED" } })
  ]);
  const day = plan?.days.find(d => d.weekday === weekday);
  const activeSession = day && !day.isRest ? await prisma.workoutSession.findFirst({ where: { userId, planId: plan?.id, title: day.name, status: { in: ["IN_PROGRESS", "PAUSED"] } }, orderBy: { startedAt: "desc" }, select: { id: true, status: true } }) : null;
  const todayKey = dateKeyForZone(new Date(),settings.timezone);
  const localHour = Number(new Intl.DateTimeFormat("en-US", { timeZone: settings.timezone, hour: "numeric", hour12: false }).format(new Date()));
  const [year,month,dayOfMonth] = todayKey.split("-").map(Number);
  const mondayAnchor = new Date(Date.UTC(year,month-1,dayOfMonth,12));
  mondayAnchor.setUTCDate(mondayAnchor.getUTCDate()-((mondayAnchor.getUTCDay()+6)%7));
  const displayedWeekKeys = weekdays.map((_,index)=>{const date=new Date(mondayAnchor);date.setUTCDate(date.getUTCDate()+index);return date.toISOString().slice(0,10);});
  const localAnchor = new Date(Date.UTC(year,month-1,dayOfMonth,12));
  const weekOffset = settings.weekStarts===0 ? localAnchor.getUTCDay() : (localAnchor.getUTCDay()+6)%7;
  localAnchor.setUTCDate(localAnchor.getUTCDate()-weekOffset);
  const weekStartKey = localAnchor.toISOString().slice(0,10);
  const activePlanSessions = sessions.filter(s=>s.planId===plan?.id);
  const completedThisWeek = activePlanSessions.filter(s=>s.completedAt&&dateKeyForZone(s.completedAt,settings.timezone)>=weekStartKey).length;
  const plannedDays = plan?.days.filter(d=>!d.isRest).length??0;
  const completedKeys = new Set(activePlanSessions.filter(s=>s.completedAt).map(s=>dateKeyForZone(s.completedAt!,settings.timezone)));
  const streak = calculateScheduledStreak(plan?.days.map(d=>({weekday:d.weekday,isRest:d.isRest}))||[],completedKeys,todayKey);
  const weightUnit: WeightUnit = settings.weightUnit === "lbs" ? "lbs" : "kg";
  const weightText = (kg:number) => `${Number(fromKilograms(kg,weightUnit).toFixed(1))} ${weightUnit}`;
  const dateKey = `${today.month} ${today.day}`;

  return <>
    <h1>Good {localHour < 12 ? "morning" : localHour < 18 ? "afternoon" : "evening"}{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}.</h1>
    <p className="subtle page-intro">{today.month} {today.day}, {today.year} <span aria-hidden="true">·</span> A steady practice is built one session at a time.</p>
    {!profile?.completedAt && <div className="panel" style={{ padding: "13px 16px", marginTop: 19, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><span className="subtle" style={{ fontSize: 12 }}>A few details will help tailor your training space.</span><Link className="outline-button" href="/profile" style={{ textDecoration: "none", fontSize: 12 }}>Complete profile <Plus size={14}/></Link></div>}
    <div className="grid stats">
      <div className="panel stat"><div className="stat-label">Completed workouts</div><div className="stat-value">{totalCompleted}</div><div className="stat-foot">All time</div></div>
      <div className="panel stat"><div className="stat-label">This week</div><div className="stat-value">{completedThisWeek}<span className="stat-unit"> / {plannedDays}</span></div><div className="stat-foot">Scheduled sessions completed</div></div>
      <div className="panel stat"><div className="stat-label">Current streak</div><div className="stat-value">{streak.current}<span className="stat-unit"> {streak.current===1?"session":"sessions"}</span></div><div className="stat-foot">Longest: {streak.longest}</div></div>
      <div className="panel stat"><div className="stat-label">Active plan</div><div className="stat-value" style={{fontSize:19}}>{plan?.name||"Not set up"}</div><div className="stat-foot">{plan?"Current training schedule":"Create your first weekly plan"}</div></div>
      <div className="panel stat"><div className="stat-label">Profile</div><div className="stat-value" style={{fontSize:19}}>{profile?.goal?.replaceAll("_"," ")||"Getting started"}</div><div className="stat-foot">{profile?.goal?"Your current focus":"Choose a goal when you're ready"}</div></div>
    </div>
    <div className="grid today-layout">
      <section className="panel today-panel">
        <div className="panel-head"><div><span className="panel-overline">Today · {dateKey}</span><h2 style={{marginTop:6}}>{day?.isRest?"A day to recover":day?.name||"No workout scheduled"}</h2></div>{day?.isRest?<span className="badge">Rest day</span>:day?<span className="badge"><Clock3 size={12}/>{profile?.sessionMinutes??60} min</span>:null}</div>
        {!plan?<div className="empty-state"><div className="empty-icon"><Plus size={17}/></div><h2 style={{marginBottom:7}}>Start with a weekly plan</h2><p className="subtle" style={{fontSize:12,maxWidth:310,margin:"0 auto 15px"}}>Choose your training days and add the exercises you want to work on.</p><Link href="/plans" className="primary-button" style={{display:"inline-flex",textDecoration:"none"}}>Create a plan</Link></div>:day?.isRest?<div className="empty-state"><div className="empty-icon"><Check size={17}/></div><p className="subtle" style={{fontSize:13,margin:0}}>Rest is part of a good training plan. Take the day to recover and come back ready.</p></div>:day?.exercises.length?<><div>{day.exercises.map((exercise,index)=><div className="exercise-row" key={exercise.id}><span className="exercise-index">{String(index+1).padStart(2,"0")}</span><div><div className="exercise-name">{exercise.name}</div><div className="exercise-meta">{exercise.sets} sets · {exercise.repsMin}–{exercise.repsMax} reps{exercise.targetKg!=null?` · ${weightText(exercise.targetKg)}`:""}</div></div><Circle size={16} color="var(--line-strong)"/></div>)}</div>{activeSession?<Link href={`/workout/${activeSession.id}`} className="primary-button" style={{display:"inline-flex",marginTop:18,textDecoration:"none"}}>{activeSession.status==="PAUSED"?"Resume paused workout":"Resume workout"}</Link>:<form action={startWorkout} style={{marginTop:18}}><input type="hidden" name="dayId" value={day.id}/><button className="primary-button" type="submit">Start workout</button></form>}</>:<div className="empty-state"><div className="empty-icon"><Plus size={17}/></div><p className="subtle" style={{fontSize:12}}>Nothing is planned for {day?.name||"today"} yet.</p><Link href="/plans" className="outline-button" style={{textDecoration:"none",fontSize:12}}>Edit plan</Link></div>}
      </section>
      <section className="panel today-panel"><div className="panel-head"><h2>This week</h2><Link href="/plans" className="text-link">View plan</Link></div><div className="week-row">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((name,i)=>{const planned=plan?.days.find(d=>d.weekday===i);const completed=completedKeys.has(displayedWeekKeys[i]);return <div key={name} className={`week-day ${i===weekday?"today":""} ${planned&&!planned.isRest?"done":""} ${completed?"completed":""}`}><span>{name}</span><strong>{completed?<Check size={14} aria-label="Completed"/>:planned?.isRest?"—":planned?.exercises.length?"●":"·"}</strong></div>;})}</div><p className="subtle week-hint">Checkmarks show completed workouts.</p>
        <div className="dashboard-subsection"><div className="panel-head"><h2>Recent activity</h2></div>{sessions.slice(0,3).length?sessions.slice(0,3).map((entry,index)=><div key={entry.id} className={`recent-row ${index?"has-border":""}`}><span>{entry.title}</span><span className="subtle">{entry.completedAt?.toLocaleDateString()}</span></div>):<p className="subtle" style={{fontSize:12,margin:0}}>Completed sessions will appear here.</p>}</div>
        <div className="dashboard-insight"><Sparkles size={15} color="var(--accent)"/><div><strong>Insights grow with your history</strong><p className="subtle">Log a few sessions to start seeing patterns in your training.</p></div></div>
      </section>
    </div>
  </>;
}
