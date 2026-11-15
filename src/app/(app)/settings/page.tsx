import { auth, signOut } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { deleteAccount, deleteAiKey, saveAiKey, testAiKey } from "@/app/actions";
import { ThemeControl } from "@/components/theme-control";
import { ActionForm, PendingSubmitButton } from "@/components/action-form";
import { ConfirmSubmit } from "@/components/confirm-submit";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  const config = await prisma.aiProviderConfig.findUnique({ where: { userId: session!.user!.id }, select: { updatedAt: true } });

  return <>
    <h1>Settings</h1>
    <p className="subtle page-intro">Personalize how OwnHero looks and manage your account connections.</p>
    <section className="panel settings-section">
      <div className="section-heading"><h2>Appearance</h2><p className="subtle">Choose a neutral theme and a small accent for interactive elements.</p></div>
      <ThemeControl/>
    </section>

    <section className="panel settings-section">
      <div className="section-heading"><h2>Groq AI</h2><p className="subtle">Your key is encrypted with AES-256-GCM and only decrypted for server-side requests. It is never returned to your browser.</p></div>
      <p className="connection-state">Connection <strong data-connected={Boolean(config)}>{config ? `Configured · ${config.updatedAt.toLocaleDateString()}` : "Not configured"}</strong></p>
      <ActionForm action={saveAiKey} successMessage="Groq API key saved and validated." className="form-stack" style={{ marginTop: 14 }}>
        <div className="field"><label htmlFor="apiKey">Groq API key</label><input id="apiKey" name="apiKey" type="password" autoComplete="new-password" minLength={20} maxLength={300} placeholder={config ? "Enter a replacement key" : "Paste your key"} required/></div>
        <PendingSubmitButton className="primary-button form-submit" pendingLabel="Validating key…">Save encrypted key</PendingSubmitButton>
      </ActionForm>
      {config && <div className="settings-actions">
        <ActionForm action={testAiKey} successMessage="Groq connection validated."><PendingSubmitButton className="outline-button" pendingLabel="Checking…">Test connection</PendingSubmitButton></ActionForm>
        <ActionForm action={deleteAiKey} successMessage="AI key removed."><ConfirmSubmit className="quiet-button" confirmTitle="Remove AI key?" description="AI insights and questions will be unavailable until you add a key again." confirmLabel="Remove key">Remove key</ConfirmSubmit></ActionForm>
      </div>}
      <p className="subtle settings-note">AI summaries are optional and use only records from your account. You can remove your key at any time.</p>
    </section>

    <section className="panel settings-section">
      <h2>Account</h2><p className="subtle settings-copy">Signed in as {session?.user?.email}. Your records are isolated to this account.</p>
      <div className="settings-actions"><Link href="/profile" className="outline-button">Edit fitness profile</Link><form action={async () => { "use server"; await signOut({ redirectTo: "/signin" }); }}><button className="outline-button" type="submit">Sign out</button></form></div>
    </section>

    <section className="panel settings-section">
      <h2>Export your data</h2><p className="subtle settings-copy">Download a JSON copy of your profile, plans, workout history, measurements, and AI records.</p><a className="outline-button" href="/api/export">Download export</a>
    </section>

    <section className="panel settings-section danger-section">
      <h2>Delete account</h2><p className="subtle settings-copy">Permanently remove your account, plans, workout history, measurements, memories, reports, and encrypted key.</p>
      <form action={deleteAccount} className="form-stack" style={{ marginTop: 12 }}><div className="field"><label htmlFor="confirmDelete">Type DELETE to confirm</label><input id="confirmDelete" name="confirmation" autoComplete="off" required pattern="DELETE"/></div><ConfirmSubmit className="primary-button danger-button" confirmTitle="Permanently delete your account?" description="This will erase your profile, plans, workout history, measurements, AI memories, reports, and encrypted key. You must also type DELETE in the field to confirm." confirmLabel="Delete account">Delete account and data</ConfirmSubmit></form>
    </section>
  </>;
}
