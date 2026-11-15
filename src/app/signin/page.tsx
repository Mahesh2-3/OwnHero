import { signIn } from "../../../auth";
import { Activity, ArrowRight } from "lucide-react";

export default function SignInPage() {
  return <main className="signin-card">
    <div className="brand" style={{ padding: 0, marginBottom: 36 }}><span className="brand-mark"><Activity size={15}/></span> hero</div>
    <h1 style={{ fontSize: 28, marginTop: 10 }}>Train with intention.</h1>
    <p className="subtle" style={{ marginBottom: 26 }}>Build a routine that fits your life. Record what you do. See how you grow.</p>
    {process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }}>
      <button className="primary-button" style={{ width: "100%", justifyContent: "center", padding: 12 }} type="submit">Continue with Google <ArrowRight size={15}/></button>
    </form> : <div className="toast">Google sign-in is ready to configure. Add AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET, and DATABASE_URL from .env.example to enable your private account and data.</div>}
    <p className="signin-privacy">Your workouts and personal fitness information are private to your account.</p>
  </main>;
}
