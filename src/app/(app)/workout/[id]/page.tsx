import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { addUnplannedExercise, finishWorkout, pauseWorkout, resumeWorkout, saveWorkoutNotes, skipSessionExercise, toggleSet, updateSetPerformance } from "@/app/actions";
import { Check, Circle } from "lucide-react";
import { notFound } from "next/navigation";
import { RestTimer } from "@/components/rest-timer";
import { fromKilograms, type WeightUnit } from "@/lib/units";
import { ActionForm, PendingSubmitButton } from "@/components/action-form";
import { ExerciseNameField, NumericStepper } from "@/components/form-controls";
import { ConfirmSubmit } from "@/components/confirm-submit";

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const ownerId = session!.user!.id;
  const workout = await prisma.workoutSession.findFirst({ where: { id, userId: ownerId }, include: { exercises: { orderBy: { sortOrder: "asc" }, include: { sets: { orderBy: { setNumber: "asc" } } } } } });
  if (!workout) notFound();
  const settings = await prisma.userSettings.upsert({ where: { userId: ownerId }, create: { userId: ownerId }, update: {} });
  const weightUnit: WeightUnit = settings.weightUnit === "lbs" ? "lbs" : "kg";
  const previousExercises = workout.exercises.length ? await prisma.sessionExercise.findMany({ where: { name: { in: workout.exercises.map(exercise => exercise.name) }, session: { userId: ownerId, status: "COMPLETED", startedAt: { lt: workout.startedAt } } }, include: { session: { select: { completedAt: true } }, sets: true }, orderBy: { session: { startedAt: "desc" } }, take: 100 }) : [];
  const previousByName = new Map<string, typeof previousExercises[number]>();
  previousExercises.forEach(previous => { const key = previous.name.trim().toLowerCase(); if (!previousByName.has(key)) previousByName.set(key, previous); });
  const setCount = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedCount = workout.exercises.reduce((total, exercise) => total + exercise.sets.filter(set => set.completed).length, 0);
  const weightText = (kg: number) => `${Number(fromKilograms(kg, weightUnit).toFixed(1))} ${weightUnit}`;
  const stateLabel = workout.status === "COMPLETED" ? "Completed session" : workout.status === "PAUSED" ? "Paused" : "In progress";

  return <>
    <h1>{workout.title}</h1>
    <div className="session-meta"><span className={`session-state session-state-${workout.status.toLowerCase()}`}>{stateLabel}</span><span>Started {workout.startedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span><span>{completedCount} of {setCount} sets complete</span>{workout.durationSec != null && <span>{Math.round(workout.durationSec / 60)} min</span>}</div>
    {workout.status === "IN_PROGRESS" && <RestTimer/>}

    {workout.exercises.map(exercise => {
      const previous = previousByName.get(exercise.name.trim().toLowerCase());
      const previousSet = previous?.sets.filter(set => set.completed).at(-1);
      return <section className="panel session-exercise" key={exercise.id}>
        <header className="session-exercise-header"><div className="session-exercise-title"><h2>{exercise.name} {exercise.skipped && <span className="badge">Skipped</span>}</h2><p className="subtle">{exercise.muscleGroup}{exercise.restSeconds ? ` · ${exercise.restSeconds}s rest` : ""}</p>{exercise.notes && <p className="subtle exercise-note">{exercise.notes}</p>}{previous && <p className="previous-result">Previous · {previous.session.completedAt?.toLocaleDateString()}{previousSet ? ` · ${previousSet.actualReps ?? "—"} reps${previousSet.actualKg != null ? ` at ${weightText(previousSet.actualKg)}` : ""}` : " · no completed sets"}</p>}</div>
          <div className="exercise-header-actions"><span className="badge">{exercise.sets.length} sets</span>{workout.status === "IN_PROGRESS" && !exercise.skipped && <ActionForm action={skipSessionExercise} successMessage="Exercise skipped."><input type="hidden" name="exerciseId" value={exercise.id}/><input type="hidden" name="sessionId" value={workout.id}/><PendingSubmitButton className="quiet-button small-button" pendingLabel="Skipping…">Skip</PendingSubmitButton></ActionForm>}</div>
        </header>
        <div className="session-set-head"><span>SET</span><span>TARGET</span><span>ACTUAL · REPS / {weightUnit.toUpperCase()} / RPE</span><span>STATUS</span></div>
        {exercise.sets.map(set => <div key={set.id} className="session-set-row">
          <strong className="set-index">{String(set.setNumber).padStart(2,"0")}</strong>
          <span className="set-target">{set.targetRepsMin === set.targetRepsMax ? set.targetRepsMin : `${set.targetRepsMin ?? "—"}–${set.targetRepsMax ?? "—"}`} reps{set.targetKg != null ? ` · ${weightText(set.targetKg)}` : ""}{set.targetRpe != null ? ` · RPE ${set.targetRpe}` : ""}</span>
          {(workout.status === "IN_PROGRESS" || workout.status === "COMPLETED") ? <ActionForm action={updateSetPerformance} successMessage={`Set ${set.setNumber} performance saved.`} className="set-performance-form"><input type="hidden" name="setId" value={set.id}/><input type="hidden" name="sessionId" value={workout.id}/><NumericStepper name="actualReps" label={`Set ${set.setNumber} actual repetitions`} min={0} max={100} defaultValue={set.actualReps ?? set.targetRepsMin ?? 0} suffix="reps"/><label className="visually-hidden" htmlFor={`actual-weight-${set.id}`}>Set {set.setNumber} actual weight in {weightUnit}</label><div className="session-weight-input"><input id={`actual-weight-${set.id}`} name="actualKg" type="number" min="0" max="1000" step="0.5" defaultValue={set.actualKg == null ? (set.targetKg == null ? "" : Number(fromKilograms(set.targetKg, weightUnit).toFixed(1))) : Number(fromKilograms(set.actualKg, weightUnit).toFixed(1))} placeholder={weightUnit}/><span>{weightUnit}</span></div><label className="visually-hidden" htmlFor={`actual-rpe-${set.id}`}>Set {set.setNumber} actual effort</label><input className="rpe-input" id={`actual-rpe-${set.id}`} name="actualRpe" type="number" min="1" max="10" step="0.5" defaultValue={set.rpe ?? ""} placeholder="RPE"/><PendingSubmitButton className="icon-save-button" aria-label={`Save set ${set.setNumber}`} title="Save set values" pendingLabel="…">Save</PendingSubmitButton></ActionForm> : <span className="set-readonly">{set.actualReps ?? "—"} reps{set.actualKg != null ? ` · ${weightText(set.actualKg)}` : ""}{set.rpe != null ? ` · RPE ${set.rpe}` : ""}</span>}
          {workout.status === "IN_PROGRESS" ? <ActionForm action={toggleSet} successMessage={set.completed ? `Set ${set.setNumber} marked incomplete.` : `Set ${set.setNumber} completed.`} className="set-complete-form"><input type="hidden" name="setId" value={set.id}/><input type="hidden" name="sessionId" value={workout.id}/><PendingSubmitButton className={set.completed ? "set-done-button" : "outline-button set-complete-button"} pendingLabel="Saving…">{set.completed ? <><Check size={14}/>Done</> : <><Circle size={14}/>Complete</>}</PendingSubmitButton></ActionForm> : <span className="badge set-status">{set.completed ? "Done" : "Skipped"}</span>}
        </div>)}
      </section>;
    })}

    {workout.status === "IN_PROGRESS" && <section className="panel session-extra-panel"><div className="section-heading"><h2>Add an exercise</h2><p className="subtle">Add something that wasn’t in today’s plan.</p></div><ActionForm action={addUnplannedExercise} successMessage="Exercise added to this workout." className="add-session-exercise-form"><input type="hidden" name="sessionId" value={workout.id}/><div className="field"><label>Exercise</label><ExerciseNameField/></div><div className="field"><label>Sets</label><NumericStepper name="sets" label="Sets" min={1} max={20} defaultValue={3}/></div><PendingSubmitButton className="outline-button">Add exercise</PendingSubmitButton></ActionForm></section>}

    <section className="panel session-extra-panel"><div className="section-heading"><h2>Workout notes</h2><p className="subtle">Keep a note on how the session felt or anything to remember.</p></div><ActionForm action={saveWorkoutNotes} successMessage="Workout notes saved." className="form-stack"><input type="hidden" name="sessionId" value={workout.id}/><textarea name="notes" maxLength={2000} rows={3} defaultValue={workout.notes || ""} placeholder="How did the session feel?"/><PendingSubmitButton className="outline-button form-submit">Save notes</PendingSubmitButton></ActionForm></section>

    {workout.status === "IN_PROGRESS" && <div className="session-actions"><ActionForm action={pauseWorkout} successMessage="Workout paused."><input type="hidden" name="sessionId" value={workout.id}/><PendingSubmitButton className="outline-button" pendingLabel="Pausing…">Pause workout</PendingSubmitButton></ActionForm><form action={finishWorkout}><input type="hidden" name="sessionId" value={workout.id}/><ConfirmSubmit className="primary-button" confirmTitle="Finish this workout?" description="Your completed sets, timing, and notes will be saved to workout history." confirmLabel="Finish workout">Finish workout</ConfirmSubmit></form></div>}
    {workout.status === "PAUSED" && <div className="session-actions"><ActionForm action={resumeWorkout} successMessage="Workout resumed."><input type="hidden" name="sessionId" value={workout.id}/><PendingSubmitButton className="primary-button" pendingLabel="Resuming…">Resume workout</PendingSubmitButton></ActionForm><form action={finishWorkout}><input type="hidden" name="sessionId" value={workout.id}/><ConfirmSubmit className="outline-button" confirmTitle="Finish this workout?" description="Your completed sets, timing, and notes will be saved to workout history." confirmLabel="Finish workout">Finish workout</ConfirmSubmit></form></div>}
  </>;
}
