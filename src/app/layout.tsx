/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "OwnHero — Training, with intention",
  description: "A calm, personal space to plan training, log performance and understand progress.",
  applicationName: "OwnHero",
  appleWebApp: { capable: true, title: "OwnHero", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icons/ownhero-192.png", sizes: "192x192", type: "image/png" }, { url: "/icons/ownhero-512.png", sizes: "512x512", type: "image/png" }],
    apple: "/icons/ownhero-192.png"
  }
};

export const viewport: Viewport = { themeColor: "#7653d6", colorScheme: "light dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const preferenceScript = `(function(){try{var t=localStorage.getItem("hero-theme");var a=localStorage.getItem("hero-accent");var themes=["light","dark","system"];var accents=["violet","blue","emerald","rose","orange","amber","cyan","red","neutral"];document.documentElement.dataset.theme=themes.indexOf(t)>=0?t:"system";document.documentElement.dataset.accent=accents.indexOf(a)>=0?a:"violet";}catch(_){}})();`;
  return <html lang="en" data-theme="system" data-accent="violet" suppressHydrationWarning><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet"/><script dangerouslySetInnerHTML={{ __html: preferenceScript }} /></head><body>{children}<PwaRegister/></body></html>;
}
