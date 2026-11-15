"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, CalendarDays, Dumbbell, Settings, UserRound, Sparkles } from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";

const items = [
  { href: "/dashboard", label: "Today", icon: Activity },
  { href: "/plans", label: "Workout plans", icon: CalendarDays },
  { href: "/history", label: "History", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/insights", label: "Insights", icon: Sparkles },
];

export function AppShell({ children, name }: { children: React.ReactNode; name?: string | null }) {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return <><FeedbackToast/><div className="app-shell"><aside className="sidebar"><Link href="/dashboard" className="brand" style={{ color: "inherit", textDecoration: "none" }}><span className="brand-mark"><Activity size={15}/></span> hero</Link><div className="nav-label">Training</div>{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-link ${active(href) ? "active" : ""}`}><Icon size={16}/>{label}</Link>)}<div className="side-bottom"><div className="nav-label">Account</div><Link href="/settings" className={`nav-link ${active("/settings") ? "active" : ""}`}><Settings size={16}/>Settings</Link><Link href="/profile" className={`nav-link ${active("/profile") ? "active" : ""}`}><UserRound size={16}/>Profile</Link></div></aside><div className="main-area"><header className="topbar"><span className="topbar-date">Your training space</span><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Link href="/settings" aria-label="Settings" title="Settings" style={{display:"grid",placeItems:"center",color:"var(--muted)"}}><Settings size={17}/></Link><span className="subtle" style={{ fontSize: 12 }}>{name || "Athlete"}</span><span className="avatar">{(name || "A").slice(0,1).toUpperCase()}</span></div></header><main className="content">{children}</main><nav className="mobile-nav">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active(href)?"page":undefined} style={{color:active(href)?"var(--accent)":undefined}}><Icon size={17}/>{label}</Link>)}</nav></div></div></>;
}
