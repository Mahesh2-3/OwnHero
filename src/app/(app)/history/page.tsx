import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HistoryPage() {
  const session = await auth();
  const workouts = await prisma.workoutSession.findMany({ where: { userId: session!.user!.id, status: "COMPLETED" }, orderBy: { completedAt: "desc" }, take: 50, include: { exercises: { include: { sets: true } } } });
  return <><h1>Workout history</h1><p className="subtle page-intro">A clear record of the work you have put in.</p><section className="history-list">
    {workouts.length ? workouts.map(workout => <article key={workout.id} className="panel history-entry"><div className="history-copy"><h2>{workout.title}</h2><div className="subtle history-meta">{workout.completedAt?.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · {workout.exercises.length} exercises · {workout.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.completed).length,0)} sets logged</div></div><Link className="outline-button" href={`/workout/${workout.id}`}>View session</Link></article>) : <div className="panel empty-state"><h2>No completed workouts</h2><p className="subtle">Finish your first session and it will be recorded here.</p><Link href="/plans" className="outline-button" style={{ textDecoration: "none" }}>View plans</Link></div>}
  </section></>;
}
