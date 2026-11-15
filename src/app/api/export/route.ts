import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const [profile, settings, plans, workouts, measurements, memories, reports] = await Promise.all([
    prisma.fitnessProfile.findUnique({ where: { userId } }), prisma.userSettings.findUnique({ where: { userId } }),
    prisma.workoutPlan.findMany({ where: { userId }, include: { days: { include: { exercises: true } } } }),
    prisma.workoutSession.findMany({ where: { userId }, include: { exercises: { include: { sets: true } } } }),
    prisma.bodyMeasurement.findMany({ where: { userId } }), prisma.aiMemory.findMany({ where: { userId } }), prisma.aiReport.findMany({ where: { userId } })
  ]);
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), profile, settings, plans, workouts, measurements, memories, reports }, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=ownhero-fitness-export.json", "Cache-Control": "private, no-store" } });
}
