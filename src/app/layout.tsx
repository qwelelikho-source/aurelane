import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurelane - Private money tracking, in rand",
  description: "Track your finances privately with Aurelane. South African rand (ZAR) support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
