"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Sparkles,
  Search,
  MapPin,
  DollarSign,
  Clock,
  Filter,
  Check,
  Target,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { fetchJobMatches, selectTargetJob, fetchCandidateProfile, JobMatchResult, CandidateProfile } from "@/lib/api";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobMatchResult[]>([]);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [minMatch, setMinMatch] = useState<number>(0);
  const [selectedJobId, setSelectedJobId] = useState<string | null>("job-101");
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>("");
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({
    "job-101": true,
  });

  useEffect(() => {
    loadCandidateProfile();
    loadJobs();
  }, []);

  const loadCandidateProfile = async () => {
    try {
      const prof = await fetchCandidateProfile("default-session");
      setCandidate(prof);
    } catch {
      // If no profile uploaded yet, backend defaults to demo profile
    }
  };

  const loadJobs = async (filterQuery?: string, filterRemote?: boolean, filterMinMatch?: number) => {
    setLoading(true);
    try {
      const q = filterQuery !== undefined ? filterQuery : searchQuery;
      const r = filterRemote !== undefined ? filterRemote : remoteOnly;
      const m = filterMinMatch !== undefined ? filterMinMatch : minMatch;

      const data = await fetchJobMatches({
        sessionId: "default-session",
        query: q || undefined,
        remoteOnly: r,
        minMatch: m > 0 ? m : undefined,
      });
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleToggleRemote = () => {
    const nextRemote = !remoteOnly;
    setRemoteOnly(nextRemote);
    loadJobs(searchQuery, nextRemote, minMatch);
  };

  const handleMinMatchChange = (val: number) => {
    setMinMatch(val);
    loadJobs(searchQuery, remoteOnly, val);
  };

  const handleSelectJob = async (jobId: string, jobTitle: string) => {
    setSelectingId(jobId);
    try {
      await selectTargetJob(jobId, "default-session");
      setSelectedJobId(jobId);
      setNotification(`Active target job set to '${jobTitle}'. Downstream agents updated!`);
      setTimeout(() => setNotification(""), 3500);
    } catch (err) {
      console.error("Failed to set active job:", err);
    } finally {
      setSelectingId(null);
    }
  };

  const toggleExpand = (jobId: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const getMatchBadgeStyle = (pct: number) => {
    if (pct >= 85) return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
    if (pct >= 70) return "bg-amber-500/15 border-amber-500/30 text-amber-400";
    return "bg-indigo-500/15 border-indigo-500/30 text-indigo-400";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Phase 3: Semantic Job Matching & AI Reasoning Engine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Semantic Job Matcher & Fit Rationale</h1>
          <p className="text-sm text-slate-400 mt-1">
            Projects candidate profiles & job requisitions into high-dimensional vector space, computing cosine similarity and transparent fit reasoning.
          </p>
        </div>

        <button
          onClick={() => loadJobs()}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/[0.08] transition-all hover:border-cyan-500/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          <span>Refresh Rankings</span>
        </button>
      </div>

      {/* Candidate Profile Context Banner */}
      <div className="glass-panel p-4 rounded-xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
            👤
          </div>
          <div>
            <p className="font-semibold text-white">
              Matching Active Candidate: <span className="text-cyan-300">{candidate?.full_name || "Alex Morgan"}</span>
            </p>
            <p className="text-slate-400">
              {candidate?.headline || "Senior Full-Stack & AI Systems Engineer"} •{" "}
              {candidate?.skills.length || 26} extracted skills indexed
            </p>
          </div>
        </div>

        <Link
          href="/resume"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
        >
          <span>Update Resume Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title, stack (e.g. FastAPI, Next.js, LangGraph, AWS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
          >
            Filter Jobs
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" /> Quick Filters:
            </span>

            <button
              onClick={handleToggleRemote}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                remoteOnly
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              🌐 Remote Only
            </button>

            {[
              { label: "All Matches", val: 0 },
              { label: "80%+ Match", val: 80 },
              { label: "85%+ High Fit", val: 85 },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => handleMinMatchChange(f.val)}
                className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                  minMatch === f.val
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-200"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400">
            Showing <strong className="text-white">{jobs.length}</strong> semantic matches
          </div>
        </div>
      </div>

      {/* Main Jobs Listing */}
      {loading ? (
        <div className="glass-panel p-16 rounded-2xl border border-white/[0.08] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-medium text-slate-300">Computing dense vector embeddings & cosine similarity...</p>
          <p className="text-xs text-slate-500">Evaluating multi-factor requirement overlap and synthesizing fit rationale</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/[0.08] text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-base font-semibold text-slate-200">No matching jobs found</p>
          <p className="text-xs text-slate-400">Try broadening your search query or lowering the minimum match threshold.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setRemoteOnly(false);
              setMinMatch(0);
              loadJobs("", false, 0);
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((item) => {
            const isTarget = selectedJobId === item.job.id;
            const isExpanded = !!expandedReasoning[item.job.id];

            return (
              <div
                key={item.job.id}
                className={`glass-panel p-6 sm:p-7 rounded-2xl border transition-all space-y-5 ${
                  isTarget
                    ? "border-cyan-500/50 shadow-lg shadow-cyan-950/40 bg-slate-900/80"
                    : "border-white/[0.08] hover:border-slate-600/60 bg-slate-900/50"
                }`}
              >
                {/* Header Row: Title, Company, Badges, Action Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-xl font-bold text-white">{item.job.title}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getMatchBadgeStyle(item.match_percentage)}`}>
                        {item.match_percentage}% Match
                      </span>
                      {isTarget && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                          <Target className="w-3 h-3 text-cyan-400" />
                          <span>Active Target Role</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-cyan-200">{item.job.company}</p>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.job.location}</span>
                      </span>
                      {item.job.salary_range && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{item.job.salary_range}</span>
                        </span>
                      )}
                      {item.job.employment_type && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.job.employment_type}</span>
                        </span>
                      )}
                      {item.job.posted_date && (
                        <span className="text-slate-500 font-mono">Posted {item.job.posted_date}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSelectJob(item.job.id, item.job.title)}
                      disabled={isTarget || selectingId === item.job.id}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isTarget
                          ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 cursor-default"
                          : "bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:border-cyan-500/40"
                      }`}
                    >
                      {isTarget ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Selected</span>
                        </>
                      ) : selectingId === item.job.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          <span>Setting...</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-3.5 h-3.5 text-slate-400" />
                          <span>Set Target Role</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/coverletter?jobId=${item.job.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
                    >
                      <span>Tailor Letter</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/interview?jobId=${item.job.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Mock Interview</span>
                    </Link>
                  </div>
                </div>

                {/* Job Description Excerpt */}
                <p className="text-xs text-slate-300 leading-relaxed">{item.job.description}</p>

                {/* Requirements Pills */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Required Competencies:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.job.requirements.map((req, rIdx) => (
                      <span key={rIdx} className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Fit Reasoning Accordion */}
                <div className="border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden">
                  <button
                    onClick={() => toggleExpand(item.job.id)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        AI Semantic Match Rationale
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-slate-800/80 space-y-4 text-xs">
                      {/* Narrative Summary */}
                      <p className="text-slate-200 leading-relaxed bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20">
                        {item.reasoning.fit_summary}
                      </p>

                      {/* Skills Overlap vs Missing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Matched Candidate Strengths</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.reasoning.matched_skills.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              >
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Identified Skill Gaps / Hurdles</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.reasoning.missing_critical_skills.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              >
                                ! {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tailoring & Application Tips */}
                      <div className="pt-2 border-t border-slate-800 space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Tailoring Strategy for this Application:
                        </p>
                        <ul className="space-y-1 text-slate-300">
                          {item.reasoning.tailoring_tips.map((tip, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-1.5">
                              <span className="text-cyan-400 mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
