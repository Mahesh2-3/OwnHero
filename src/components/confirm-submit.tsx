"use client";

import { useRef } from "react";

type ConfirmSubmitProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmTitle: string;
  description: string;
  confirmLabel: string;
};

export function ConfirmSubmit({ confirmTitle, description, confirmLabel, children, ...props }: ConfirmSubmitProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function confirm() {
    const form = dialogRef.current?.closest("form");
    dialogRef.current?.close();
    form?.requestSubmit();
  }

  return <>
    <button {...props} type="button" onClick={() => dialogRef.current?.showModal()}>{children}</button>
    <dialog className="confirm-dialog" ref={dialogRef} onClick={event => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}>
    <h2>{confirmTitle}</h2>
      <p>{description}</p>
      <div className="dialog-actions">
        <button className="outline-button" type="button" onClick={() => dialogRef.current?.close()}>Cancel</button>
        <button className="primary-button danger-button" type="button" onClick={confirm}>{confirmLabel}</button>
      </div>
    </dialog>
  </>;
}
