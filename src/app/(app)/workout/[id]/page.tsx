import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { addUnplannedExercise, finishWorkout, pauseWorkout, resumeWorkout, saveWorkoutNotes, skipSessionExercise, toggleSet, updateSetPerformance } from "@/app/actions";
import { Check, Circle } from "lucide-react";
import { notFound } from "next/navigation";
import { RestTimer } from "@/components/rest-timer";
import { fromKilograms, type WeightUnit } from "@/lib/units";

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const ownerId = session!.user!.id;
  const workout = await prisma.workoutSession.findFirst({ where: { id, userId: ownerId }, include: { exercises: { orderBy: { sortOrder: "asc" }, include: { sets: { orderBy: { setNumber: "asc" } } } } } });
  if (!workout) notFound();
  const settings = await prisma.userSettings.upsert({where:{userId:ownerId},create:{userId:ownerId},update:{}});
  const weightUnit: WeightUnit = settings.weightUnit === "lbs" ? "lbs" : "kg";
  const previousExercises = workout.exercises.length ? await prisma.sessionExercise.findMany({ where: { name: { in: workout.exercises.map(e=>e.name) }, session: { userId: ownerId, status: "COMPLETED", startedAt: { lt: workout.startedAt } } }, include: { session: { select: { completedAt: true } }, sets: true }, orderBy: { session: { startedAt: "desc" } }, take: 100 }) : [];
  const previousByName = new Map<string,typeof previousExercises[number]>();
  previousExercises.forEach(previous=>{const key=previous.name.trim().toLowerCase();if(!previousByName.has(key))previousByName.set(key,previous);});
  const setCount = workout.exercises.reduce((n,e)=>n+e.sets.length,0);
  const completedCount = workout.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.completed).length,0);
  const weightText = (kg: number) => `${Number(fromKilograms(kg,weightUnit).toFixed(1))} ${weightUnit}`;
  return <><div className="eyebrow">{workout.status === "COMPLETED" ? "Completed session" : workout.status === "PAUSED" ? "Workout paused" : "Workout in progress"}</div><h1>{workout.title}</h1><p className="subtle">Started {workout.startedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {completedCount} of {setCount} sets complete{workout.durationSec!=null?` · ${Math.round(workout.durationSec/60)} min`:""}</p>
    {workout.status === "IN_PROGRESS" && <RestTimer/>}
    {workout.exercises.map(exercise=>{
      const previous=previousByName.get(exercise.name.trim().toLowerCase());
      const previousSet=previous?.sets.filter(s=>s.completed).at(-1);
      return <section className="panel" key={exercise.id} style={{padding:19,marginBottom:13}}>
        <div className="panel-head" style={{marginBottom:12}}><div><h2>{exercise.name} {exercise.skipped&&<span className="badge">Skipped</span>}</h2><div className="subtle" style={{fontSize:11,marginTop:4}}>{exercise.muscleGroup}{exercise.restSeconds?` · ${exercise.restSeconds}s rest`:""}</div>{exercise.notes&&<p className="subtle" style={{fontSize:11,margin:"6px 0 0"}}>{exercise.notes}</p>}{previous&&<p className="subtle" style={{fontSize:10,margin:"6px 0 0"}}>Previous · {previous.session.completedAt?.toLocaleDateString()}{previousSet?` · ${previousSet.actualReps??"—"} reps${previousSet.actualKg!=null?` at ${weightText(previousSet.actualKg)}`:""}`:" · no completed sets"}</p>}</div><div style={{display:"flex",gap:7,alignItems:"center"}}><span className="badge">{exercise.sets.length} sets</span>{workout.status==="IN_PROGRESS"&&!exercise.skipped&&<form action={skipSessionExercise}><input type="hidden" name="exerciseId" value={exercise.id}/><input type="hidden" name="sessionId" value={workout.id}/><button className="quiet-button" type="submit" style={{fontSize:10,padding:"5px 7px"}}>Skip</button></form>}</div></div>
        <div className="session-set-head" style={{display:"grid",gridTemplateColumns:"36px minmax(95px,1fr) minmax(100px,1.2fr) 85px",gap:8,padding:"8px 0",color:"#89918b",fontSize:10,borderBottom:"1px solid var(--line)"}}><span>SET</span><span>TARGET</span><span>ACTUAL · REPS / {weightUnit.toUpperCase()} / RPE</span><span></span></div>
        {exercise.sets.map(set=><div key={set.id} className="session-set-row" style={{display:"grid",gridTemplateColumns:"36px minmax(95px,1fr) minmax(100px,1.2fr) 85px",gap:8,alignItems:"center",padding:"11px 0",borderBottom:"1px solid #eef0ed"}}>
          <strong style={{fontSize:12}}>{set.setNumber}</strong>
          <span className="subtle" style={{fontSize:12}}>{set.targetRepsMin===set.targetRepsMax?set.targetRepsMin:`${set.targetRepsMin??"—"}–${set.targetRepsMax??"—"}`} reps{set.targetKg!=null?` · ${weightText(set.targetKg)}`:""}{set.targetRpe!=null?` · RPE ${set.targetRpe}`:""}</span>
          {(workout.status==="IN_PROGRESS"||workout.status==="COMPLETED")?<form action={updateSetPerformance} style={{display:"flex",gap:4,alignItems:"center"}}><input type="hidden" name="setId" value={set.id}/><input type="hidden" name="sessionId" value={workout.id}/><input name="actualReps" type="number" min="0" max="100" defaultValue={set.actualReps??set.targetRepsMin??0} aria-label="Actual repetitions" style={{width:48,padding:6,border:"1px solid var(--line)",borderRadius:4}}/><input name="actualKg" type="number" min="0" step="0.5" defaultValue={set.actualKg==null?(set.targetKg==null?"":Number(fromKilograms(set.targetKg,weightUnit).toFixed(1))):Number(fromKilograms(set.actualKg,weightUnit).toFixed(1))} placeholder={weightUnit} aria-label={`Actual weight in ${weightUnit}`} style={{width:52,padding:6,border:"1px solid var(--line)",borderRadius:4}}/><input name="actualRpe" type="number" min="1" max="10" step="0.5" defaultValue={set.rpe??""} placeholder="RPE" aria-label="Actual RPE" style={{width:48,padding:6,border:"1px solid var(--line)",borderRadius:4}}/><button type="submit" className="quiet-button" style={{padding:"5px 6px",fontSize:10}}>Save</button></form>:<span style={{fontSize:12}}>{set.actualReps??"—"} reps{set.actualKg!=null?` · ${weightText(set.actualKg)}`:""}{set.rpe!=null?` · RPE ${set.rpe}`:""}</span>}
          {workout.status==="IN_PROGRESS"?<form action={toggleSet}><input type="hidden" name="setId" value={set.id}/><input type="hidden" name="sessionId" value={workout.id}/><button className={set.completed?"badge":"outline-button"} style={{justifyContent:"center",width:"100%"}} type="submit">{set.completed?<><Check size={13}/> Done</>:<><Circle size={13}/> Complete</>}</button></form>:<span className="badge">{set.completed?"Done":"Skipped"}</span>}
        </div>)}
      </section>;
    })}
    {workout.status==="IN_PROGRESS"&&<section className="panel" style={{padding:18,marginTop:16}}><h2 style={{fontSize:14,marginBottom:10}}>Add an exercise</h2><form action={addUnplannedExercise} style={{display:"flex",gap:8,alignItems:"end",flexWrap:"wrap"}}><input type="hidden" name="sessionId" value={workout.id}/><label className="field" style={{flex:1,minWidth:160}}>Exercise name<input name="name" maxLength={80} required/></label><label className="field" style={{width:90}}>Sets<input name="sets" type="number" min="1" max="20" defaultValue="3"/></label><button className="outline-button" type="submit">Add exercise</button></form></section>}
    <section className="panel" style={{padding:18,marginTop:12}}><h2 style={{fontSize:14,marginBottom:10}}>Workout notes</h2><form action={saveWorkoutNotes} className="form-stack"><input type="hidden" name="sessionId" value={workout.id}/><textarea name="notes" maxLength={2000} rows={3} defaultValue={workout.notes||""} placeholder="How did the session feel?"/><button className="outline-button" type="submit" style={{justifyContent:"center",alignSelf:"start"}}>Save notes</button></form></section>
    {workout.status==="IN_PROGRESS"&&<div style={{display:"flex",gap:9,marginTop:22}}><form action={pauseWorkout}><input type="hidden" name="sessionId" value={workout.id}/><button className="outline-button" type="submit">Pause workout</button></form><form action={finishWorkout}><input type="hidden" name="sessionId" value={workout.id}/><button className="primary-button" type="submit">Finish workout</button></form></div>}
    {workout.status==="PAUSED"&&<div style={{display:"flex",gap:9,marginTop:22}}><form action={resumeWorkout}><input type="hidden" name="sessionId" value={workout.id}/><button className="primary-button" type="submit">Resume workout</button></form><form action={finishWorkout}><input type="hidden" name="sessionId" value={workout.id}/><button className="outline-button" type="submit">Finish workout</button></form></div>}
  </>;
}
