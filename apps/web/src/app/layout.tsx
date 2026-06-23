import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INGLY OS — Gestionale Enterprise",
  description: "Piattaforma SaaS per artigiani laser & personalizzazione",
  icons: { icon: "https://img.icons8.com/fluency/96/laser.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
