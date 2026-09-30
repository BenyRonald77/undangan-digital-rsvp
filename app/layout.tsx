import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Undangan Digital + RSVP",
  description: "Undangan digital, RSVP, QR check-in, dan antrean WhatsApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen text-slate-900">{children}</body>
    </html>
  );
}
