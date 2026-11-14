export type TrainingDay = { weekday: number; isRest: boolean };

function toKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,"0")}-${String(date.getUTCDate()).padStart(2,"0")}`;
}

export function calculateScheduledStreak(days: TrainingDay[], completedKeys: Set<string>, todayKey: string) {
  const [year, month, day] = todayKey.split("-").map(Number);
  const anchor = new Date(Date.UTC(year, month - 1, day, 12));
  const scheduled = new Set(days.filter(item => !item.isRest).map(item => item.weekday));
  const dayForOffset = (offset: number) => {
    const date = new Date(anchor);
    date.setUTCDate(date.getUTCDate() - offset);
    return { key: toKey(date), weekday: (date.getUTCDay() + 6) % 7 };
  };
  let current = 0;
  for (let offset = 0; offset <= 365; offset++) {
    const date = dayForOffset(offset);
    if (!scheduled.has(date.weekday)) continue;
    const done = completedKeys.has(date.key);
    if (offset === 0 && !done) continue;
    if (!done) break;
    current++;
  }
  let longest = 0;
  let running = 0;
  for (let offset = 365; offset >= 0; offset--) {
    const date = dayForOffset(offset);
    if (!scheduled.has(date.weekday)) continue;
    if (completedKeys.has(date.key)) running++;
    else running = 0;
    longest = Math.max(longest, running);
  }
  return { current, longest };
}

export function calculateTrainingVolume(exercises: { sets: { completed: boolean; actualReps: number | null; actualKg: number | null }[] }[]) {
  return exercises.reduce((total, exercise) => total + exercise.sets.filter(set => set.completed).reduce((sum, set) => sum + (set.actualReps ?? 0) * (set.actualKg ?? 0), 0), 0);
}
