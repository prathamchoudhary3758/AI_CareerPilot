"use client";

import { useEffect, useState } from "react";
import { Briefcase, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, Zap, Sparkles } from "lucide-react";
import { fetchJobMatches, JobMatchResult } from "@/lib/api";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchJobMatches();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-2">
            <span>Phase 3 Agent Shell</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Semantic Job Matcher & Reasoning</h1>
          <p className="text-sm text-slate-400">Embeddings-based matching calculating cosine similarity & explaining the "Why you fit" narrative.</p>
        </div>

        <button
          onClick={loadJobs}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/[0.08] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          <span>Refresh Matches</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/[0.08] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-400">Computing semantic embeddings & cosine similarity rankings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((item) => (
            <div
              key={item.job.id}
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08] hover:border-cyan-500/30 transition-all space-y-6"
            >
              {/* Top Row: Title, Company, Match Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{item.job.title}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                      {item.match_percentage}% Match
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium">
                    {item.job.company} • <span className="text-slate-400">{item.job.location}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Salary: {item.job.salary_range} • {item.job.employment_type} • Posted {item.job.posted_date}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/coverletter?jobId=${item.job.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
                  >
                    <span>Tailor Cover Letter</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/interview?jobId=${item.job.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
                  >
                    <span>Mock Interview</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Reasoning Card */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>AI Match Reasoning</span>
                  </p>
                  <p className="text-sm text-slate-200">{item.reasoning.fit_summary}</p>
                </div>

                {/* Skills Match vs Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Strong Candidate Overlap</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.reasoning.matched_skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-amber-300 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Missing Critical Qualifications</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.reasoning.missing_critical_skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tailoring Tips */}
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Application Strategy Tip:</p>
                  <p className="text-xs text-slate-300">{item.reasoning.tailoring_tips[0]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
