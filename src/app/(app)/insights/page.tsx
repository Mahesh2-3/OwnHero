import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { addAiMemory, askFitnessQuestion, deleteAiMemory, generateDailyReport } from "@/app/actions";
import { Brain, Sparkles, Trash2 } from "lucide-react";
import { ActionForm, PendingSubmitButton } from "@/components/action-form";
import { ConfirmSubmit } from "@/components/confirm-submit";

export default async function InsightsPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const [settings, config, memories, latest, questions] = await Promise.all([
    prisma.userSettings.findUnique({ where: { userId } }),
    prisma.aiProviderConfig.findUnique({ where: { userId }, select: { userId: true } }),
    prisma.aiMemory.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 30 }),
    prisma.aiReport.findFirst({ where: { userId, kind: "daily" }, orderBy: { createdAt: "desc" } }),
    prisma.aiReport.findMany({ where: { userId, kind: "analysis" }, orderBy: { createdAt: "desc" }, take: 10 })
  ]);
  const report = latest?.content as { summary?: string; nextSession?: string; recovery?: string; highlights?: string[]; dataLimitations?: string[] } | undefined;
  const isToday = latest?.dateKey === new Intl.DateTimeFormat("en-CA", { timeZone: settings?.timezone || "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  return <>
    <h1>Insights</h1>
    <p className="subtle page-intro">AI observations use your logged workouts, measurements, profile, and saved memories.</p>
    <section className="panel insight-section">
      <div className="section-heading"><div className="icon-heading"><Sparkles size={17}/><h2>Daily training report</h2></div><p className="subtle">Generated once per day and saved to your account.</p></div>
      {latest?.status === "PENDING" && <p className="inline-status">Your report is being generated.</p>}
      {report && latest?.status !== "PENDING" && <div className="report-content"><span className="badge">{latest?.dateKey}</span><p className="report-summary">{report.summary}</p>{report.highlights?.length ? <ul className="report-highlights">{report.highlights.map((item,index) => <li key={index}>{item}</li>)}</ul> : null}
        <div className="report-columns"><div><strong>Next session</strong><p>{report.nextSession}</p></div><div><strong>Recovery</strong><p>{report.recovery}</p></div></div>
        {report.dataLimitations?.length ? <p className="report-limitations">Data limits: {report.dataLimitations.join(" · ")}</p> : null}
      </div>}
      {config ? <ActionForm action={generateDailyReport} successMessage="Your training report is ready."><PendingSubmitButton className="primary-button" pendingLabel="Generating report…" disabled={Boolean(isToday)}>{isToday ? "Today's report is ready" : report ? "Generate today's report" : "Generate report"}</PendingSubmitButton></ActionForm> : <p className="toast">Add your Groq API key in Settings to enable reports. Workout planning and tracking work without AI.</p>}
    </section>

    <section className="panel insight-section">
      <div className="section-heading"><div className="icon-heading"><Sparkles size={17}/><h2>Ask about your training</h2></div><p className="subtle">Answers are grounded in your records. Up to 10 questions each UTC day.</p></div>
      {config ? <ActionForm action={askFitnessQuestion} successMessage="Your answer is ready." className="form-stack insight-question-form"><div className="field"><label htmlFor="question">Your question</label><textarea id="question" name="question" minLength={5} maxLength={500} rows={3} required placeholder="e.g. How has my squat changed over the last month?"/></div><PendingSubmitButton className="outline-button form-submit" pendingLabel="Reviewing your records…">Ask about my records</PendingSubmitButton></ActionForm> : <p className="subtle">Connect your Groq key in Settings to ask questions.</p>}
      {questions.map(item => { const answer = item.content as { question?: string; answer?: string; dataLimitations?: string[] }; return <article className="answer-entry" key={item.id}><span className="answer-date">{item.createdAt.toLocaleString()}</span><h3>{answer.question}</h3><p>{answer.answer}</p>{answer.dataLimitations?.length ? <p className="report-limitations">Data limits: {answer.dataLimitations.join(" · ")}</p> : null}</article>; })}
    </section>

    <section className="panel insight-section">
      <div className="section-heading"><div className="icon-heading"><Brain size={17}/><h2>Fitness memory</h2></div><p className="subtle">Keep durable preferences and context available to future reports. You control these notes.</p></div>
      <ActionForm action={addAiMemory} successMessage="Memory saved." className="memory-form"><div className="field"><label htmlFor="category">Category</label><select id="category" name="category"><option>Preference</option><option>Equipment</option><option>Goal</option><option>Limitation</option><option>Schedule</option><option>Other</option></select></div><div className="field"><label htmlFor="memory">Memory</label><input id="memory" name="content" maxLength={500} minLength={3} required placeholder="e.g. I prefer shorter workouts on weekdays"/></div><PendingSubmitButton className="outline-button" pendingLabel="Saving…">Save memory</PendingSubmitButton></ActionForm>
      {memories.length ? <div className="memory-list">{memories.map(memory => <div className="memory-row" key={memory.id}><span className="badge">{memory.category}</span><span className="memory-content">{memory.content}</span><ActionForm action={deleteAiMemory} successMessage="Memory removed."><input type="hidden" name="memoryId" value={memory.id}/><ConfirmSubmit className="icon-button danger-icon-button" confirmTitle="Remove this memory?" description="This note will no longer be included as context for future reports or answers." confirmLabel="Remove memory" title="Delete memory" aria-label="Delete memory"><Trash2 size={14}/></ConfirmSubmit></ActionForm></div>)}</div> : <p className="empty-copy">No saved memories yet.</p>}
    </section>
  </>;
}
