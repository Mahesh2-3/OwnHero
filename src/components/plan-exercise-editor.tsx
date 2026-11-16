"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { addExercise, updateExercise } from "@/app/actions";
import { ActionForm, PendingSubmitButton } from "@/components/action-form";

type PlanExerciseEditorProps = {
  mode: "add" | "update";
  recordId: string;
  children: ReactNode;
};

export function PlanExerciseEditor({ mode, recordId, children }: PlanExerciseEditorProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const isAdd = mode === "add";

  return <div className={`plan-exercise-editor ${isAdd ? "is-add-editor" : "is-edit-editor"} ${open ? "is-expanded" : ""}`}>
    <button type="button" className={isAdd ? "add-exercise-trigger" : "exercise-edit-trigger"} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}>
      {isAdd ? "+  Add exercise" : open ? "Close editor" : "Edit"}
      {!isAdd && (open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>)}
    </button>
    {open && <section className="exercise-editor-panel" id={panelId} aria-label={isAdd ? "Add exercise form" : "Edit exercise form"}>
      <header className="exercise-editor-header">
        <div><h3>{isAdd ? "Add an exercise" : "Edit exercise"}</h3><p className="subtle">Set up the movement, targets and rest period.</p></div>
        <button type="button" className="quiet-button editor-close-button" onClick={() => setOpen(false)}>Close</button>
      </header>
      <ActionForm action={isAdd ? addExercise : updateExercise} successMessage={isAdd ? "Exercise added to your plan." : "Exercise changes saved."} onSuccess={() => setOpen(false)} className="exercise-editor-form">
        <input type="hidden" name={isAdd ? "dayId" : "exerciseId"} value={recordId}/>
        <div className="exercise-editor-fields">{children}</div>
        <PendingSubmitButton className="primary-button exercise-editor-submit" pendingLabel={isAdd ? "Adding exercise…" : "Saving changes…"}>{isAdd ? "Add exercise" : "Save changes"}</PendingSubmitButton>
      </ActionForm>
    </section>}
  </div>;
}
