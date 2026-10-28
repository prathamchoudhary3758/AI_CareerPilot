"use client";

import Link from "next/link";
import { Sparkles, Bot, Terminal } from "lucide-react";
import BackendStatusBadge from "./BackendStatusBadge";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.06] px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                AI Career Co-Pilot
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Phase 1 Scaffolding
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Agent Job Prep & Application Platform</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/[0.05]">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/resume"
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Resume Analyzer
          </Link>
          <Link
            href="/jobs"
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Job Matcher
          </Link>
          <Link
            href="/coverletter"
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Cover Letter
          </Link>
          <Link
            href="/interview"
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Interview Prep
          </Link>
          <Link
            href="/activity"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Feed</span>
          </Link>
        </nav>

        {/* Status & Docs */}
        <div className="flex items-center gap-3">
          <BackendStatusBadge />
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800/80 border border-white/[0.06] transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Swagger API</span>
          </a>
        </div>
      </div>
    </header>
  );
}
