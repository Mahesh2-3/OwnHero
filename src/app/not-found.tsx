import Link from "next/link";

export default function NotFound() {
  return <main style={{ maxWidth: 520, margin: "15vh auto", padding: 24 }}><div className="eyebrow">404 · Not found</div><h1>This page isn’t here.</h1><p className="subtle">The link may be out of date, or the page may have moved.</p><Link href="/dashboard" className="primary-button" style={{display:"inline-flex",textDecoration:"none",marginTop:12}}>Back to today</Link></main>;
}
