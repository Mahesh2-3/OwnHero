"use client";

import { Check, Info, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { FlashKind } from "@/lib/flash";

type Notice = { id: number; kind: FlashKind; message: string };

export function FeedbackToast() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const addNotice = (kind: FlashKind, message: string) => {
      const id = Date.now() + Math.random();
      setNotices(current => [...current, { id, kind, message }]);
      window.setTimeout(() => setNotices(current => current.filter(item => item.id !== id)), 5000);
    };
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ kind: FlashKind; message: string }>).detail;
      if (detail?.kind && detail.message) addNotice(detail.kind, detail.message);
    };
    window.addEventListener("hero:toast", onToast);

    const entry = document.cookie.split("; ").find(value => value.startsWith("hero-notice="));
    if (!entry) return () => window.removeEventListener("hero:toast", onToast);

    const value = decodeURIComponent(entry.slice("hero-notice=".length));
    const separator = value.indexOf("|");
    if (separator < 0) return () => window.removeEventListener("hero:toast", onToast);

    const kind = value.slice(0, separator) as FlashKind;
    const message = value.slice(separator + 1);
    document.cookie = "hero-notice=; path=/; max-age=0; samesite=lax";
    if (["success", "error", "info"].includes(kind) && message) addNotice(kind, message);
    return () => window.removeEventListener("hero:toast", onToast);
  }, [pathname]);

  if (!notices.length) return null;

  return <div className="toast-region" aria-live="polite" aria-relevant="additions removals">
    {notices.map(notice => {
      const Icon = notice.kind === "success" ? Check : notice.kind === "error" ? XCircle : Info;
      return <div className="toast-item" data-kind={notice.kind} role={notice.kind === "error" ? "alert" : "status"} key={notice.id}>
        <Icon size={17} aria-hidden="true" />
        <span>{notice.message}</span>
        <button className="toast-close" type="button" aria-label="Dismiss notification" onClick={() => setNotices(current => current.filter(item => item.id !== notice.id))}><X size={15} /></button>
      </div>;
    })}
  </div>;
}
