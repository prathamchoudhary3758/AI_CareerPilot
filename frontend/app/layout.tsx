import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Career Co-Pilot — Multi-Agent Job Prep & Application Platform",
  description: "End-to-end multi-agent orchestration for resume optimization, semantic job matching, cover letters, and mock interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#090D16] text-slate-100 antialiased flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200`}>
        {/* Ambient decorative glowing spots */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px]" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[130px]" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen bg-grid-pattern">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
          <footer className="glass-panel border-t border-white/[0.06] py-6 text-center text-xs text-slate-500">
            <p>© 2026 AI Career Co-Pilot — Multi-Agent Orchestrated Platform</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
