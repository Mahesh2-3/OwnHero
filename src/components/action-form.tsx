"use client";

import { createContext, useContext, useTransition } from "react";
import type { FormEvent, FormHTMLAttributes, ReactNode } from "react";
import type { FlashKind } from "@/lib/flash";

type ServerFormAction = (formData: FormData) => Promise<void | { error: string }>;
const PendingContext = createContext(false);

function notify(kind: FlashKind, message: string) {
  window.dispatchEvent(new CustomEvent("hero:toast", { detail: { kind, message } }));
}

export function ActionForm({ action, successMessage, onSuccess, children, ...props }: Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> & { action: ServerFormAction; successMessage: string; onSuccess?: () => void; children: ReactNode }) {
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result && "error" in result) {
          notify("error", result.error);
          return;
        }
        notify("success", successMessage);
        onSuccess?.();
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
