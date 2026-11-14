import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HistoryPage() {
  const session = await auth();
  const workouts = await prisma.workoutSession.findMany({ where: { userId: session!.user!.id, status: "COMPLETED" }, orderBy: { completedAt: "desc" }, take: 50, include: { exercises: { include: { sets: true } } } });
  return <><div className="eyebrow">Your training record</div><h1>Workout history</h1><p className="subtle" style={{ marginTop: 0 }}>A clear record of the work you have put in.</p><section style={{ marginTop: 24 }}>
    {workouts.length ? workouts.map(workout => <article key={workout.id} className="panel" style={{ padding: "17px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15 }}><div><h2 style={{ fontSize: 14 }}>{workout.title}</h2><div className="subtle" style={{ fontSize: 11, marginTop: 6 }}>{workout.completedAt?.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · {workout.exercises.length} exercises · {workout.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.completed).length,0)} sets logged</div></div><Link className="outline-button" href={`/workout/${workout.id}`} style={{ textDecoration: "none", fontSize: 11 }}>View</Link></article>) : <div className="panel empty-state"><h2>No completed workouts</h2><p className="subtle">Finish your first session and it will be recorded here.</p><Link href="/plans" className="outline-button" style={{ textDecoration: "none" }}>View plans</Link></div>}
  </section></>;
}
