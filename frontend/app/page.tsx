"use client";

import Link from "next/link";
import {
  FileText,
  Briefcase,
  PenTool,
  Mic,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  ChevronRight,
  Sliders
} from "lucide-react";

export default function DashboardPage() {
  const tools = [
    {
      title: "Resume Review & ATS Audit",
      description: "Extract structured skills, calculate an ATS compatibility score, and receive targeted bullet point rewrites to highlight measurable outcomes.",
      status: "Ready to use",
      statusType: "success",
      href: "/resume",
      icon: FileText,
      tag: "Phase 2 Core",
    },
    {
      title: "Job Matching & Skill Comparison",
      description: "Compare your resume profile against tech job postings. View semantic match percentages, shared competencies, and critical missing skills.",
      status: "Ready to use",
      statusType: "success",
      href: "/jobs",
      icon: Briefcase,
      tag: "Phase 3 Core",
    },
    {
      title: "Tailored Cover Letter",
      description: "Draft role-specific cover letters aligned with your verified background, with automatic hallucination checks to prevent false claims.",
      status: "Available",
      statusType: "neutral",
      href: "/coverletter",
      icon: PenTool,
      tag: "Phase 4",
    },
    {
      title: "Interview Practice & Feedback",
      description: "Practice answering behavioral and technical questions evaluated against the STAR framework (Situation, Task, Action, Result).",
      status: "Available",
      statusType: "neutral",
      href: "/interview",
      icon: Mic,
      tag: "Phase 4",
    },
    {
      title: "Pipeline Activity Stream",
      description: "Inspect the real-time background logs and state progression of document parsing, vector indexing, and evaluation steps.",
      status: "Live Log",
      statusType: "neutral",
      href: "/activity",
      icon: Layers,
      tag: "Phase 5",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-8 sm:p-10 shadow-xs">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <span>Career Preparation Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Prepare your applications with clear, practical feedback.
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            Upload your resume to check ATS compliance, evaluate how closely your experience matches open roles, and practice interview questions before your real conversation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors shadow-xs"
            >
              <span>Review Your Resume</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium transition-colors shadow-xs"
            >
              <span>Browse Job Matches</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Overview Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-medium">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ATS Scoring</p>
              <p className="text-sm font-semibold text-slate-900">PyMuPDF + Local RAG</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-medium">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Job Alignment</p>
              <p className="text-sm font-semibold text-slate-900">Semantic Vector Ranking</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-medium">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Accuracy Standard</p>
              <p className="text-sm font-semibold text-slate-900">Fact-Checked Guardrails</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tools Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Platform Tools</h2>
          <p className="text-sm text-slate-500">Select any tool to begin or continue working on your application materials.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.title}
                href={t.href}
                className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {t.tag}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        t.statusType === "success"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {t.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Open workspace</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
