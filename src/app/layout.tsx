import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hero — Training, with intention",
  description: "A calm, personal space to plan training, log performance and understand progress."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="system"><body>{children}</body></html>;
}
