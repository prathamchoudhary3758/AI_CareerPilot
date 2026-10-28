"use client";

import Link from "next/link";
import { 
  FileText, 
  Briefcase, 
  PenTool, 
  Mic, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Layers 
} from "lucide-react";
import BackendStatusBadge from "@/components/BackendStatusBadge";

export default function DashboardPage() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Foundation & System Scaffolding",
      description: "FastAPI async core, Next.js 14 App Router, unified Pydantic schemas, and dark glassmorphic design system.",
      status: "Active / Completed",
      active: true,
      href: "#",
      icon: Layers,
      color: "from-cyan-500 to-blue-600",
      stats: "FastAPI • Next.js 14 • Tailwind",
    },
    {
      phase: "Phase 2",
      title: "Resume Analyzer & RAG Scoring",
      description: "PyMuPDF parsing, structured candidate profiling, local ChromaDB ATS best-practice RAG, and impact bullet rewrites.",
      status: "Up Next",
      active: false,
      href: "/resume",
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
      stats: "PyMuPDF • ChromaDB • ATS Scoring",
    },
    {
      phase: "Phase 3",
      title: "Semantic Job Matcher & Reasoning",
      description: "Vector embedding similarity, candidate-to-JD gap analysis, and LLM reasoning badges ('Why this job fits you').",
      status: "Planned",
      active: false,
      href: "/jobs",
      icon: Briefcase,
      color: "from-indigo-500 to-purple-600",
      stats: "Embeddings • Semantic Ranking",
    },
    {
      phase: "Phase 4",
      title: "Cover Letter & Interview Prep",
      description: "Tailored cover letter generator with hallucination guardrail, plus STAR-method interactive mock interview evaluator.",
      status: "Planned",
      active: false,
      href: "/coverletter",
      icon: PenTool,
      color: "from-purple-500 to-pink-600",
      stats: "Guardrails • STAR Rubric Scorer",
    },
    {
      phase: "Phase 5",
      title: "LangGraph Orchestrator & Live Feed",
      description: "End-to-end StateGraph routing between agents with real-time SSE stream for agent trace observability.",
      status: "Planned",
      active: false,
      href: "/activity",
      icon: Bot,
      color: "from-pink-500 to-rose-600",
      stats: "LangGraph • SSE Stream • Observability",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 border border-white/[0.08] shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Career Acceleration Engine</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI Career Co-Pilot <br />
            <span className="text-gradient-cyan">Multi-Agent Orchestration</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            An intelligent pipeline designed to ingest your resume, semantically match top-tier roles,
            generate fact-checked application collateral, and conduct rubric-scored mock interviews.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Resume Analyzer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/activity"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/[0.1] text-slate-200 font-medium transition-all hover:scale-[1.02]"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Live Agent Activity Feed</span>
            </Link>
          </div>
        </div>

        {/* Ambient Decorative Graphic in Hero */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 hidden lg:block opacity-25 pointer-events-none">
          <div className="w-96 h-96 rounded-full border border-cyan-500/30 flex items-center justify-center animate-pulse">
            <div className="w-64 h-64 rounded-full border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-24 h-24 text-cyan-400" />
            </div>
          </div>
        </div>
      </section>

      {/* System Health & Architecture Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">FastAPI Core</p>
            <p className="text-sm font-semibold text-slate-200">Async REST + SSE Engine</p>
          </div>
          <BackendStatusBadge />
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Agent Orchestrator</p>
            <p className="text-sm font-semibold text-slate-200">LangGraph StateGraph</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Ready for P2-P5
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Safety & Accuracy</p>
            <p className="text-sm font-semibold text-slate-200">Fact-Check Guardrails</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Active Contracts
          </span>
        </div>
      </section>

      {/* 5-Phase Roadmap Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">5-Phase Architecture Roadmap</h2>
            <p className="text-sm text-slate-400">Step-by-step implementation milestones with end-to-end integration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phases.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={p.phase}
                className={`relative group rounded-2xl glass-panel p-6 border transition-all duration-300 flex flex-col justify-between ${
                  p.active
                    ? "border-cyan-500/40 shadow-lg shadow-cyan-500/10 bg-slate-900/80"
                    : "border-white/[0.06] hover:border-slate-600/50 bg-slate-900/40"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                      {p.phase}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        p.active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {p.active && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${p.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {p.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">{p.stats}</span>
                  {p.href !== "#" ? (
                    <Link
                      href={p.href}
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Preview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-emerald-400 font-medium">Ready</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
