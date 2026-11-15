import "server-only";
import { cookies } from "next/headers";

export type FlashKind = "success" | "error" | "info";

export async function flash(kind: FlashKind, message: string) {
  const jar = await cookies();
  jar.set("hero-notice", `${kind}|${encodeURIComponent(message)}`, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 45,
    path: "/"
  });
}
