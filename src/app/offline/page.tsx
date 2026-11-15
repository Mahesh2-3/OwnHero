import Image from "next/image";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return <main className="offline-page">
    <div className="brand offline-brand"><Image src="/icons/ownhero-mark.webp" alt="" width={34} height={34} className="offline-brand-mark"/>OwnHero</div>
    <section className="offline-card">
      <span className="offline-icon"><WifiOff size={22}/></span>
      <p className="offline-kicker">CONNECTION PAUSED</p>
      <h1>You’re offline.</h1>
      <p className="subtle">Reconnect to open your training space. For your privacy, workout pages and personal data aren’t stored on this device for offline use.</p>
      <a href="/dashboard" className="primary-button offline-retry">Try again</a>
    </section>
  </main>;
}
