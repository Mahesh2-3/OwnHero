"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Activity, BarChart3, CalendarDays, Dumbbell, Settings, UserRound, Sparkles } from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";
import { NavigationProgress } from "@/components/navigation-progress";

const items = [
  { href: "/dashboard", label: "Today", icon: Activity },
  { href: "/plans", label: "Workout plans", icon: CalendarDays },
  { href: "/history", label: "History", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/insights", label: "Insights", icon: Sparkles },
];

function MobileMoreMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const links = [
    { href: "/profile", label: "Profile", icon: UserRound },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/history", label: "History", icon: Dumbbell },
  ];

  return <div className="mobile-more-wrap" ref={rootRef}>
    <button type="button" className="mobile-more-trigger" aria-expanded={open} aria-controls="mobile-more-panel" onClick={() => setOpen(value => !value)}>
      <Settings size={17}/><span>More</span>
    </button>
    {open && <div className="mobile-more-panel" id="mobile-more-panel" aria-label="More navigation">
      {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}><Icon size={16}/>{label}</Link>)}
    </div>}
  </div>;
}

export function AppShell({ children, name }: { children: React.ReactNode; name?: string | null }) {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return <>
    <FeedbackToast/>
    <NavigationProgress/>
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand" style={{ color: "inherit", textDecoration: "none" }}><span className="brand-mark"><Image src="/icons/ownhero-mark.webp" alt="" width={30} height={30} className="brand-mark-image"/></span> OwnHero</Link>
        <div className="nav-label">Training</div>
        {items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-link ${active(href) ? "active" : ""}`} aria-current={active(href) ? "page" : undefined}><Icon size={16}/>{label}</Link>)}
        <div className="side-bottom">
          <div className="nav-label">Account</div>
          <Link href="/settings" className={`nav-link ${active("/settings") ? "active" : ""}`} aria-current={active("/settings") ? "page" : undefined}><Settings size={16}/>Settings</Link>
          <Link href="/profile" className={`nav-link ${active("/profile") ? "active" : ""}`} aria-current={active("/profile") ? "page" : undefined}><UserRound size={16}/>Profile</Link>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span className="topbar-date">Your training space</span>
          <div className="topbar-user">
            <Link href="/settings" className="topbar-settings" aria-label="Settings" title="Settings"><Settings size={17}/></Link>
            <span className="topbar-name">{name || "Athlete"}</span>
            <span className="avatar">{(name || "A").slice(0,1).toUpperCase()}</span>
          </div>
        </header>
        <main className="content">{children}</main>
        <nav className="mobile-nav" aria-label="Primary navigation">
          {items.filter(item => item.href !== "/history").map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}><Icon size={17}/><span>{label === "Workout plans" ? "Plans" : label}</span></Link>)}
          <MobileMoreMenu/>
        </nav>
      </div>
    </div>
  </>;
}
