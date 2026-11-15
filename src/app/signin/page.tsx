import { signIn } from "../../../auth";
import Image from "next/image";
import { Activity, ArrowRight, ArrowUpRight, CalendarDays, ChartNoAxesColumnIncreasing, Dumbbell, LockKeyhole } from "lucide-react";

export default function SignInPage() {
  return <main className="signin-layout">
    <section className="signin-story" aria-labelledby="signin-story-title">
      <Image src="/ownhero-logo.webp" alt="OwnHero" width={230} height={154} priority className="signin-brand-image"/>
      <div className="signin-story-content">
        <span className="signin-kicker"><span/>YOUR TRAINING, WITH INTENTION</span>
        <h1 id="signin-story-title">Build strength<br/>that <span>stays with you.</span></h1>
        <p className="signin-story-copy">A calmer way to plan your workouts, keep track of the work, and see your progress add up.</p>

        <div className="training-preview" aria-label="Illustrative weekly training preview">
          <div className="preview-heading"><div><span className="preview-overline">SAMPLE WEEK</span><h2>Your training rhythm</h2></div><button className="preview-more" type="button" aria-label="Sample preview"><ArrowUpRight size={16}/></button></div>
          <div className="preview-stats"><div><strong>04</strong><span>sessions</span></div><div><strong>2.8k</strong><span>kg volume</span></div><div><strong>3 wk</strong><span>in rhythm</span></div></div>
          <div className="preview-chart-wrap"><div className="preview-chart-title"><span>Weekly activity</span><span>Last 7 days</span></div><div className="preview-chart" aria-hidden="true"><div className="preview-gridline"/><div className="preview-gridline"/><div className="preview-gridline"/><svg viewBox="0 0 520 112" preserveAspectRatio="none"><defs><linearGradient id="preview-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".28"/><stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs><path d="M0 88 C35 82 43 74 76 78 S125 49 154 61 S207 69 230 43 S282 56 306 38 S360 53 382 26 S437 39 460 20 S495 31 520 12 V112 H0Z" fill="url(#preview-fill)"/><path d="M0 88 C35 82 43 74 76 78 S125 49 154 61 S207 69 230 43 S282 56 306 38 S360 53 382 26 S437 39 460 20 S495 31 520 12" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/></svg></div><div className="preview-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div>
          <div className="preview-routine"><span className="preview-routine-icon"><Dumbbell size={15}/></span><div><strong>A routine that fits your week</strong><span>Plan · Train · Reflect</span></div><span className="preview-routine-dot"/></div>
        </div>

        <div className="signin-benefits"><div><CalendarDays size={16}/><span>Plan with purpose</span></div><div><Dumbbell size={16}/><span>Log every set</span></div><div><ChartNoAxesColumnIncreasing size={16}/><span>Notice your progress</span></div></div>
      </div>
      <div className="signin-story-foot"><span>SMALL STEPS. STRONGER DAYS.</span><span className="signin-story-foot-mark"><Activity size={13}/></span></div>
    </section>

    <section className="signin-auth" aria-labelledby="signin-title">
      <div className="signin-auth-inner">
        <span className="signin-auth-kicker">YOUR PERSONAL TRAINING SPACE</span>
        <h2 id="signin-title">Welcome back.</h2>
        <p className="signin-auth-copy">Pick up where you left off and keep building.</p>
        {process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }}>
          <button className="google-sign-in-button" type="submit"><span className="google-mark" aria-hidden="true">G</span><span>Continue with Google</span><ArrowRight size={16}/></button>
        </form> : <div className="toast signin-config-note">Google sign-in is not configured yet. Set AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET, and DATABASE_URL on the server.</div>}
        <div className="signin-divider"><span/></div>
        <div className="signin-privacy"><span className="signin-lock"><LockKeyhole size={15}/></span><p><strong>Your training stays yours.</strong><span>Your workouts and personal fitness information are private to your account.</span></p></div>
        <p className="signin-auth-foot">By continuing, you’ll be securely signed in with your Google account.</p>
      </div>
      <div className="signin-auth-bottom"><span>OWNHERO · TRAINING WITH INTENTION</span><span>01 / 01</span></div>
    </section>
  </main>;
}
