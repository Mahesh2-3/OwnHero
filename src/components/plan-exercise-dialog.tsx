"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { addExercise, updateExercise } from "@/app/actions";
import { ActionForm, PendingSubmitButton } from "@/components/action-form";

type PlanExerciseDialogProps = {
  mode: "add" | "update";
  recordId: string;
  children: ReactNode;
};

export function PlanExerciseDialog({ mode, recordId, children }: PlanExerciseDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isAdd = mode === "add";

  return <>
    <button type="button" className={isAdd ? "add-exercise-trigger" : "exercise-edit-trigger"} onClick={() => dialogRef.current?.showModal()}>
      {isAdd ? "+  Add exercise" : "Edit"}
    </button>
    <dialog ref={dialogRef} className="exercise-dialog" onClick={event => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}>
      <header className="exercise-dialog-header">
        <div><h2>{isAdd ? "Add an exercise" : "Edit exercise"}</h2><p className="subtle">Set up the movement, target and rest period.</p></div>
        <button type="button" className="icon-button" aria-label="Close exercise editor" onClick={() => dialogRef.current?.close()}><X size={17}/></button>
      </header>
      <ActionForm action={isAdd ? addExercise : updateExercise} successMessage={isAdd ? "Exercise added to your plan." : "Exercise changes saved."} onSuccess={() => dialogRef.current?.close()} className="exercise-dialog-form">
        <input type="hidden" name={isAdd ? "dayId" : "exerciseId"} value={recordId}/>
        {children}
        <PendingSubmitButton className="primary-button exercise-dialog-submit" pendingLabel={isAdd ? "Adding exercise…" : "Saving changes…"}>{isAdd ? "Add exercise" : "Save exercise"}</PendingSubmitButton>
      </ActionForm>
    </dialog>
  </>;
}
