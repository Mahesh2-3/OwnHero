import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { activatePlan, archivePlan, createPlan, duplicateExercise, moveExercise, removeExercise, updateWorkoutDay } from "@/app/actions";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import { fromKilograms, type WeightUnit } from "@/lib/units";
import { NumericStepper, RestDurationField, WeightControl } from "@/components/form-controls";
import { ExercisePicker } from "@/components/exercise-picker";
import { ActionForm, PendingSubmitButton } from "@/components/action-form";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { PlanExerciseEditor } from "@/components/plan-exercise-editor";

type PlanExercise = { id: string; name: string; muscleGroup: string|null; equipment: string|null; sets: number; repsMin: number; repsMax: number; targetKg: number|null; restSeconds: number; rpe: number|null; notes: string|null };

function ExerciseFields({ exercise, weightUnit }: { exercise?: PlanExercise; weightUnit: WeightUnit }) {
  const targetWeight = exercise?.targetKg == null ? null : Number(fromKilograms(exercise.targetKg, weightUnit).toFixed(1));
  return <>
    <div className="exercise-name-field"><div className="field"><label>Exercise</label><ExercisePicker defaultName={exercise?.name || ""} defaultMuscleGroup={exercise?.muscleGroup || ""} defaultEquipment={exercise?.equipment || ""}/></div></div>
    <div className="form-grid-three"><div className="field compact-field"><label>Sets</label><NumericStepper name="sets" label="Sets" min={1} max={20} defaultValue={exercise?.sets??3}/></div><div className="field compact-field"><label>Rep min</label><NumericStepper name="repsMin" label="Minimum repetitions" min={1} max={100} defaultValue={exercise?.repsMin??8}/></div><div className="field compact-field"><label>Rep max</label><NumericStepper name="repsMax" label="Maximum repetitions" min={1} max={100} defaultValue={exercise?.repsMax??12}/></div></div>
    <div className="form-grid-two"><div className="field"><label>Target load ({weightUnit}) <span className="subtle">(optional)</span></label><WeightControl name="targetKg" label="Target load" unit={weightUnit} defaultValue={targetWeight}/></div><div className="field"><label>Rest duration</label><RestDurationField defaultValue={exercise?.restSeconds??90}/></div></div>
    <div className="field"><label>Target effort <span className="subtle">(optional)</span></label><input name="rpe" type="number" min="1" max="10" step="0.5" defaultValue={exercise?.rpe??""} placeholder="RPE 1–10"/></div>
    <div className="field exercise-notes-field"><label>Exercise notes <span className="subtle">(optional)</span></label><textarea name="notes" maxLength={500} rows={2} defaultValue={exercise?.notes||""} placeholder="Add a cue or setup note"/></div>
  </>;
}

export default async function PlansPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const [plans, settings] = await Promise.all([
    prisma.workoutPlan.findMany({ where: { userId, archived: false }, include: { days: { include: { exercises: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } }, orderBy: { weekday: "asc" } } }, orderBy: { createdAt: "desc" } }),
    prisma.userSettings.upsert({ where: { userId }, create: { userId }, update: {} })
  ]);
  const weightUnit: WeightUnit = settings.weightUnit === "lbs" ? "lbs" : "kg";

  return <>
    <h1>Workout plans</h1>
    <p className="subtle page-intro">Build a weekly rhythm that fits your training and recovery.</p>
    <section className="panel create-plan-panel">
      <div><h2>Create a plan</h2><p className="subtle">Start with a name, then shape each day around your routine.</p></div>
      <ActionForm action={createPlan} successMessage="Workout plan created." className="create-plan-form">
        <label className="visually-hidden" htmlFor="planName">Plan name</label><input id="planName" name="name" required maxLength={60} placeholder="e.g. Strength foundation" />
        <PendingSubmitButton className="primary-button" pendingLabel="Creating…"><Plus size={15}/>Create plan</PendingSubmitButton>
      </ActionForm>
    </section>

    {!plans.length ? <div className="panel empty-state plan-empty"><div className="empty-icon"><Plus size={18}/></div><h2>No plans yet</h2><p className="subtle">Create a weekly plan to start building your training schedule.</p></div> : <div className="plan-list">{plans.map(plan => <section className="plan-card" key={plan.id}>
      <header className="plan-header"><div><div className="plan-title-row"><h2>{plan.name}</h2>{plan.active && <span className="badge">Active plan</span>}</div><p className="subtle">{plan.days.filter(day => !day.isRest).length} training days <span aria-hidden="true">·</span> Created {plan.createdAt.toLocaleDateString()}</p></div>
        <div className="settings-actions">{!plan.active && <ActionForm action={activatePlan} successMessage="Active plan changed."><input type="hidden" name="planId" value={plan.id}/><PendingSubmitButton className="outline-button" pendingLabel="Setting active…">Set active</PendingSubmitButton></ActionForm>}
          <ActionForm action={archivePlan} successMessage="Plan archived."><input type="hidden" name="planId" value={plan.id}/><ConfirmSubmit className="quiet-button" confirmTitle="Archive this plan?" description="This plan will be hidden from your active schedules. Past workouts that used it remain in your history." confirmLabel="Archive plan">Archive</ConfirmSubmit></ActionForm>
        </div>
      </header>
      <div className="plan-week-scroll"><div className="plan-week-grid">{plan.days.map(day => <article className={`plan-day ${day.isRest ? "is-rest" : ""}`} key={day.id}>
        <ActionForm action={updateWorkoutDay} successMessage="Workout day updated." className="plan-day-form">
          <input type="hidden" name="dayId" value={day.id}/>
          <label className="visually-hidden" htmlFor={`day-name-${day.id}`}>Workout day name</label><input id={`day-name-${day.id}`} className="day-name-input" name="name" defaultValue={day.name} maxLength={60} required />
          <fieldset className="day-type-fieldset"><legend className="visually-hidden">Day type</legend><div className="day-type-switch"><label><input type="radio" name="isRest" value="false" defaultChecked={!day.isRest}/><span>Train</span></label><label><input type="radio" name="isRest" value="true" defaultChecked={day.isRest}/><span>Rest</span></label></div></fieldset>
          <PendingSubmitButton className="quiet-button day-save" pendingLabel="Saving…">Save day</PendingSubmitButton>
        </ActionForm>
        {day.exercises.length > 0 ? <ul className="planned-exercise-list">{day.exercises.map((exercise,index) => <li className="planned-exercise" key={exercise.id}>
          <div className="planned-exercise-heading"><span className="exercise-index">{String(index + 1).padStart(2,"0")}</span><div className="planned-exercise-copy"><strong>{exercise.name}</strong><span>{exercise.sets} × {exercise.repsMin}–{exercise.repsMax}{exercise.targetKg != null ? ` · ${Number(fromKilograms(exercise.targetKg,weightUnit).toFixed(1))} ${weightUnit}` : ""}</span></div></div>
          <div className="exercise-tool-row"><ActionForm action={moveExercise} successMessage="Exercise order updated."><input type="hidden" name="exerciseId" value={exercise.id}/><input type="hidden" name="direction" value="up"/><PendingSubmitButton className="icon-button" aria-label="Move exercise up" title="Move exercise up" disabled={index===0}><ArrowUp size={14}/></PendingSubmitButton></ActionForm>
            <ActionForm action={moveExercise} successMessage="Exercise order updated."><input type="hidden" name="exerciseId" value={exercise.id}/><input type="hidden" name="direction" value="down"/><PendingSubmitButton className="icon-button" aria-label="Move exercise down" title="Move exercise down" disabled={index===day.exercises.length-1}><ArrowDown size={14}/></PendingSubmitButton></ActionForm>
            <PlanExerciseEditor mode="update" recordId={exercise.id}><ExerciseFields exercise={exercise} weightUnit={weightUnit}/></PlanExerciseEditor>
            <ActionForm action={duplicateExercise} successMessage="Exercise duplicated."><input type="hidden" name="exerciseId" value={exercise.id}/><PendingSubmitButton className="icon-button" title="Duplicate exercise" aria-label="Duplicate exercise"><Copy size={14}/></PendingSubmitButton></ActionForm>
            <ActionForm action={removeExercise} successMessage="Exercise removed from your plan."><input type="hidden" name="exerciseId" value={exercise.id}/><ConfirmSubmit className="icon-button danger-icon-button" confirmTitle="Remove this exercise?" description={`${exercise.name} will be removed from this plan. Workout records already completed are kept.`} confirmLabel="Remove exercise" title="Remove exercise" aria-label="Remove exercise"><Trash2 size={14}/></ConfirmSubmit></ActionForm>
          </div>
        </li>)}</ul> : <p className="day-empty">{day.isRest ? "A recovery day" : "No exercises yet"}</p>}
        {!day.isRest && <div className="add-exercise"><PlanExerciseEditor mode="add" recordId={day.id}><ExerciseFields weightUnit={weightUnit}/></PlanExerciseEditor></div>}
      </article>)}</div></div>
    </section>)}</div>}
  </>;
}
