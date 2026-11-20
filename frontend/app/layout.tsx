import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Career Co-Pilot — Practical Job Search & Application Assistant",
  description: "An organized workspace for resume analysis, targeted job discovery, application preparation, and interview practice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 Career Co-Pilot. Built for focused job preparation.</p>
            <p className="text-slate-400">FastAPI backend • Next.js frontend</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
