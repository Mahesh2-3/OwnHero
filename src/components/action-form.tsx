"use client";

import { createContext, useContext, useTransition } from "react";
import type { FormEvent, FormHTMLAttributes, ReactNode } from "react";
import type { FlashKind } from "@/lib/flash";

type ServerFormAction = (formData: FormData) => Promise<void>;
const PendingContext = createContext(false);

function notify(kind: FlashKind, message: string) {
  window.dispatchEvent(new CustomEvent("hero:toast", { detail: { kind, message } }));
}

export function ActionForm({ action, successMessage, children, ...props }: Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> & { action: ServerFormAction; successMessage: string; children: ReactNode }) {
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await action(formData);
        notify("success", successMessage);
      } catch (error) {
        const message = error instanceof Error && error.message && !error.message.includes("digest")
          ? error.message
          : "That change could not be saved. Please try again.";
        notify("error", message);
      }
    });
  }

  return <PendingContext.Provider value={pending}><form {...props} onSubmit={submit} aria-busy={pending || undefined}>{children}</form></PendingContext.Provider>;
}

export function PendingSubmitButton({ children, pendingLabel = "Saving…", disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string }) {
  const pending = useContext(PendingContext);
  return <button {...props} type="submit" disabled={disabled || pending} aria-busy={pending || undefined}>{pending ? pendingLabel : children}</button>;
}
