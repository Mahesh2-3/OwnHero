import Link from "next/link";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { fromKilograms, type WeightUnit } from "@/lib/units";

function localKey(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = Object.fromEntries(parts.map(p => [p.type,p.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function LineChart({ values, unit }: { values: { label: string; value: number }[]; unit: string }) {
  if (values.length < 2) return <div className="empty-state"><p className="subtle" style={{fontSize:12,margin:0}}>Not enough recorded values to draw a trend yet.</p></div>;
  const width=600, height=190, pad=25;
  const vals=values.map(x=>x.value), low=Math.min(...vals), high=Math.max(...vals), span=high-low || 1;
  const points=values.map((item,i)=>({x:pad+(width-2*pad)*i/(values.length-1),y:height-pad-(item.value-low)/span*(height-2*pad),item}));
  return <><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Recorded ${unit} progression chart`} style={{width:"100%",height:"auto",display:"block",overflow:"visible"}}><line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="var(--line)"/><line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="var(--line)"/><polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points.map(p=>`${p.x},${p.y}`).join(" ")}/>{points.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--accent)"><title>{p.item.label}: {p.item.value} {unit}</title></circle>)}</svg><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)"}}><span>{values[0].label}</span><span>{Math.max(...vals).toLocaleString()} {unit}</span><span>{values.at(-1)?.label}</span></div></>;
}

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ days?: string; start?: string; end?: string }> }) {
  const session = await auth();
  const ownerId = session!.user!.id;
  const params = await searchParams;
  const allowed = [7,30,90,180,365];
  const days = allowed.includes(Number(params.days)) ? Number(params.days) : 90;
  const customStart = params.start && /^\d{4}-\d{2}-\d{2}$/.test(params.start) ? new Date(`${params.start}T00:00:00Z`) : null;
  const customEnd = params.end && /^\d{4}-\d{2}-\d{2}$/.test(params.end) ? new Date(`${params.end}T23:59:59Z`) : null;
  const isCustom = Boolean(customStart && customEnd && customStart <= customEnd && customEnd.getTime()-customStart.getTime() <= 366*86400000);
  const [settings, measurements, totalWorkoutCount] = await Promise.all([
    prisma.userSettings.upsert({ where:{userId:ownerId},create:{userId:ownerId},update:{} }),
    prisma.bodyMeasurement.findMany({ where:{userId:ownerId},orderBy:{recordedAt:"asc"},take:180 }),
    prisma.workoutSession.count({where:{userId:ownerId,status:"COMPLETED"}})
  ]);
  const weightUnit: WeightUnit = settings.weightUnit === "lbs" ? "lbs" : "kg";
  const now = new Date();
  const start = isCustom ? customStart! : new Date(now.getTime()-days*86400000);
  const end = isCustom ? customEnd! : now;
  const visibleMeasurements = measurements.filter(m=>m.recordedAt>=start&&m.recordedAt<=end);
  const activityStart = new Date(now.getTime()-100*86400000);
  const [workouts, activity] = await Promise.all([
    prisma.workoutSession.findMany({ where:{userId:ownerId,status:"COMPLETED",completedAt:{gte:start,lte:end}},orderBy:{completedAt:"asc"},take:500,include:{exercises:{include:{sets:true}}} }),
    prisma.workoutSession.findMany({ where:{userId:ownerId,status:"COMPLETED",completedAt:{gte:activityStart}},select:{completedAt:true} })
  ]);
  const daily = new Map<string,number>();
  activity.forEach(w=>{if(w.completedAt){const key=localKey(w.completedAt,settings.timezone);daily.set(key,(daily.get(key)||0)+1);}});
  const heat=Array.from({length:98},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(97-i));return daily.get(localKey(d,settings.timezone))||0;});
  const totalVolume=fromKilograms(workouts.reduce((sum,w)=>sum+w.exercises.reduce((subtotal,e)=>subtotal+e.sets.filter(s=>s.completed).reduce((setSum,s)=>setSum+(s.actualReps||0)*(s.actualKg||0),0),0),0),weightUnit);
  const byDate=new Map<string,{label:string;value:number}>();
  workouts.forEach(w=>{if(!w.completedAt)return;const key=localKey(w.completedAt,settings.timezone);const volume=w.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.completed).reduce((k,s)=>k+(s.actualReps||0)*(s.actualKg||0),0),0);const date=w.completedAt.toLocaleDateString(undefined,{month:"short",day:"numeric"});const current=byDate.get(key);byDate.set(key,{label:date,value:(current?.value||0)+volume});});
  const strengthByExercise=new Map<string,{name:string;records:{label:string;value:number}[]}>();
  workouts.forEach(w=>{if(!w.completedAt)return;w.exercises.forEach(e=>{const best=Math.max(0,...e.sets.filter(s=>s.completed&&s.actualKg!=null).map(s=>s.actualKg!));if(!best)return;const key=e.name.trim().toLowerCase();const found=strengthByExercise.get(key)||{name:e.name,records:[]};found.records.push({label:w.completedAt!.toLocaleDateString(undefined,{month:"short",day:"numeric"}),value:fromKilograms(best,weightUnit)});strengthByExercise.set(key,found);});});
  const strength=[...strengthByExercise.values()].sort((a,b)=>b.records.length-a.records.length)[0];
  const personalRecords=new Map<string,{name:string;weight:number}>();
  workouts.forEach(w=>w.exercises.forEach(e=>e.sets.filter(s=>s.completed&&s.actualKg!=null).forEach(set=>{const key=e.name.toLowerCase();const weight=fromKilograms(set.actualKg!,weightUnit);const previous=personalRecords.get(key);if(!previous||weight>previous.weight)personalRecords.set(key,{name:e.name,weight});})));
  const milestones=[1,5,10,25,50,100];
  const weightSeries=visibleMeasurements.filter(m=>m.weightKg!=null).map(m=>({label:m.recordedAt.toLocaleDateString(undefined,{month:"short",day:"numeric"}),value:fromKilograms(m.weightKg!,weightUnit)}));
  const weekly=new Map<string,number>();
  workouts.forEach(w=>{if(w.completedAt){const d=new Date(w.completedAt);const monday=(d.getDay()+6)%7;d.setDate(d.getDate()-monday);const key=localKey(d,settings.timezone);weekly.set(key,(weekly.get(key)||0)+1);}});
  return <><h1>Progress</h1><p className="subtle page-intro">Charts use completed sets and measurements you recorded. Missing values are left out.</p>
    <div className="time-range-links">{allowed.map(n=><Link key={n} href={`/progress?days=${n}`} className={!isCustom&&days===n?"badge":"outline-button"}>{n===180?"6 months":n===365?"1 year":`${n} days`}</Link>)}</div>
    <form method="GET" className="date-filter"><label className="field">From<input type="date" name="start" defaultValue={isCustom?params.start:undefined}/></label><label className="field">To<input type="date" name="end" defaultValue={isCustom?params.end:undefined}/></label><button className="outline-button" type="submit">Apply dates</button>{isCustom&&<span className="badge">Custom period</span>}</form>
    <div className="grid stats"><div className="panel stat"><div className="stat-label">Sessions logged</div><div className="stat-value">{workouts.length}</div><div className="stat-foot">Selected period</div></div><div className="panel stat"><div className="stat-label">Recorded volume</div><div className="stat-value">{Math.round(totalVolume).toLocaleString()}</div><div className="stat-foot">{weightUnit} × reps · completed sets</div></div><div className="panel stat"><div className="stat-label">Body measurements</div><div className="stat-value">{visibleMeasurements.length}</div><div className="stat-foot">Entries recorded</div></div></div>
    <section className="panel analytics-panel"><div className="panel-head"><div><h2>Training activity</h2><p className="subtle panel-description">Recent 14 weeks · darker cells indicate more sessions</p></div></div><div className="heatmap" role="img" aria-label="Training activity heatmap">{heat.map((n,i)=><div key={i} title={`${n} workout${n===1?"":"s"}`} className={`heat-cell ${n?`l${Math.min(n,4)}`:""}`}/>)}</div>{!workouts.length&&<p className="subtle no-data-copy">Log sessions to populate your activity map.</p>}</section>
    <div className="grid today-layout" style={{marginTop:16}}><section className="panel today-panel"><h2 style={{marginBottom:5}}>Training volume</h2><p className="subtle" style={{fontSize:11}}>Daily completed-set volume · {weightUnit} × repetitions</p><LineChart values={[...byDate.values()].map(v=>({...v,value:fromKilograms(v.value,weightUnit)}))} unit={`${weightUnit} × reps`}/></section><section className="panel today-panel"><h2 style={{marginBottom:5}}>Body weight</h2><p className="subtle" style={{fontSize:11}}>Recorded measurements · {weightUnit}</p>{visibleMeasurements.length? <LineChart values={weightSeries} unit={weightUnit}/>:<p className="subtle" style={{fontSize:12}}>No body measurements for this period.</p>}</section></div>
    <div className="grid today-layout" style={{marginTop:16}}><section className="panel today-panel"><h2 style={{marginBottom:5}}>Strength progression</h2><p className="subtle" style={{fontSize:11}}>Highest actual completed-set weight per session for {strength?.name || "an exercise"} · {weightUnit} lifted</p>{strength?<LineChart values={strength.records} unit={weightUnit}/>:<p className="subtle" style={{fontSize:12}}>Repeated exercise records will show a trend here. No strength trend is inferred from planned targets.</p>}</section><section className="panel today-panel"><h2 style={{marginBottom:5}}>Weekly consistency</h2><p className="subtle" style={{fontSize:11}}>Completed sessions by week</p>{weekly.size? [...weekly.entries()].slice(-8).map(([key,count])=><div key={key} className="weekly-row"><span className="subtle">{key}</span><span className="weekly-bar-track"><span className="weekly-bar" style={{width:`${Math.min(count/5*100,100)}%`}}/></span><strong>{count}</strong></div>):<p className="subtle" style={{fontSize:12}}>Complete sessions to see weekly consistency.</p>}</section></div>
    <div className="grid today-layout analytics-grid"><section className="panel today-panel"><h2>Heaviest recorded sets</h2><p className="subtle panel-description">Actual completed sets · selected period · not estimated one-rep max</p>{personalRecords.size?[...personalRecords.values()].sort((a,b)=>b.weight-a.weight).slice(0,8).map(record=><div key={record.name} className="exercise-row"><span className="exercise-index">{record.name.slice(0,1)}</span><div><div className="exercise-name">{record.name}</div><div className="exercise-meta">{Number(record.weight.toFixed(1))} {weightUnit}</div></div></div>):<p className="subtle no-data-copy">No completed weighted sets in this period yet.</p>}</section><section className="panel today-panel"><h2>Consistency milestones</h2><p className="subtle panel-description">Based on completed workouts across your account.</p><div className="milestone-list">{milestones.map(n=><span key={n} className={totalWorkoutCount>=n?"badge":"outline-button"}>{n} sessions {totalWorkoutCount>=n?"· reached":""}</span>)}</div><p className="subtle milestone-total">{totalWorkoutCount} completed session{totalWorkoutCount===1?"":"s"} recorded in total.</p></section></div>
  </>;
}
