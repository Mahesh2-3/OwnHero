import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return <AppShell name={session.user.name}>{children}</AppShell>;
}
